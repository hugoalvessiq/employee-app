use crate::db;
use crate::user_model::User;
use crate::user_model::UserWithoutPassword;
use actix_identity::Identity;
use actix_web::{web, HttpResponse, Responder};
use bcrypt::{hash, DEFAULT_COST};
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Bson, Document};
use mongodb::Collection;
use regex::Regex;
use serde::Deserialize;
use serde::Serialize;
use serde_json::json;

use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use std::env;

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    sub: String,        // Field where user ID is stored
    exp: Option<usize>, // Expiration field (optional)
}

fn is_password_secure(password: &str) -> bool {
    let min_length = 8; // Minimum length
    let has_uppercase = Regex::new(r"[A-Z]").unwrap(); // Checks if it contains uppercase letters
    let has_lowercase = Regex::new(r"[a-z]").unwrap(); // Check if it contains lowercase letters
    let has_digit = Regex::new(r"\d").unwrap(); // Checks if contains digits
    let has_special_char = Regex::new(r"[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]").unwrap(); // Checks if contains characters especiais

    password.len() >= min_length
        && has_uppercase.is_match(password)
        && has_lowercase.is_match(password)
        && has_digit.is_match(password)
        && has_special_char.is_match(password)
}

pub async fn register_user(user: web::Json<User>) -> impl Responder {
    let db = db::get_database_connection().await.unwrap();
    let collection: mongodb::Collection<Document> = db.collection("user");

    // Convert the "name" field to lowercase
    let lowercase_name = user.name.trim().to_lowercase();

    // Check if an exact match for name already exists in the database
    let filter_name = doc! { "name": &lowercase_name };
    if let Some(_) = collection
        .find_one(filter_name.clone(), None)
        .await
        .unwrap()
    {
        return HttpResponse::Conflict()
            .json(json!({ "message": "Login not available, try another one!" }));
    }

    // Check password security
    if !is_password_secure(&user.password) {
        return HttpResponse::BadRequest()
            .json(json!({ "message": "Password does not meet security requirements!" }));
    }

    // Hash the user's password
    let hashed_password = hash(&user.password, DEFAULT_COST).unwrap();

    // If no existing document found, proceed with insertion
    let doc = doc! {
        "name": &lowercase_name,
        "password": &hashed_password,
        "roles": user.roles.iter().map(|p| p.to_document()).collect::<Vec<_>>(),
        "create_date": &user.create_date,
    };

    // Insert the new document into the collection
    collection.insert_one(doc, None).await.unwrap();

    // Return success response with the inserted user data
    HttpResponse::Created().json(user.0)
}

pub async fn get_user_single(id: Identity) -> impl Responder {
    // Check if identity is present
    let token = match id.identity() {
        Some(t) => t,
        None => {
            return HttpResponse::Unauthorized().json(json!({ "message": "Unauthorized Access!" }))
        }
    };

    // Decode the token to get the user ID
    // Here is the logic to decode the token and extract the ID
    let user_id = match decode_jwt_token(&token) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(json!({ "message": "Invalid Token" })),
    };
    let db = db::get_database_connection().await.unwrap();
    let collection: Collection<Document> = db.collection("user");

    // Filtrar com base no ID do usuário
    let filter = doc! { "_id": mongodb::bson::oid::ObjectId::parse_str(&user_id).unwrap() };

    if let Some(user_doc) = collection.find_one(filter, None).await.unwrap() {
        if let Ok(user) = bson::from_bson::<User>(Bson::Document(user_doc.clone())) {
            let id_string = user_doc
                .get("_id")
                .and_then(|id| id.as_object_id())
                .map(|oid| oid.to_hex());

            let user_without_password = UserWithoutPassword {
                id: id_string,
                name: user.name,
                roles: user.roles,
                // Add any other fields you want to include in the response
            };

            return HttpResponse::Ok().json(user_without_password);
        }
    }

    HttpResponse::NotFound().json(json!({ "message": "User not found" }))
}

pub fn decode_jwt_token(token: &str) -> Result<String, &'static str> {
    // Load the environment secret key
    let secret_key = env::var("SECRET_KEY").map_err(|_| "Secret key not set")?;
    let decoding_key = DecodingKey::from_secret(secret_key.as_ref());

    // Validation settings
    let validation = Validation::new(Algorithm::HS256);

    // Decode the token
    match decode::<Claims>(token, &decoding_key, &validation) {
        Ok(token_data) => {
            // Extract the user ID (field 'sub' in this example)
            Ok(token_data.claims.sub)
        }
        Err(e) => {
            eprintln!("Token decoding error: {:?}", e); // Add logging to help with debugging
            Err("Invalid token")
        }
    }
}

// #[delete("/user/{id}")]
pub async fn delete_user(id: web::Path<String>) -> impl Responder {
    // Trying to parse ObjectId from path string
    let object_id = match ObjectId::parse_str(&id.into_inner()) {
        Ok(object_id) => object_id,
        Err(e) => {
            // If there is an error parsing the ObjectId, return JSON with error
            return HttpResponse::BadRequest()
                .json(json!({ "message": "Invalid ID", "error": format!("{}", e) }));
        }
    };

    let db = db::get_database_connection().await.unwrap();
    let collection: mongodb::Collection<Document> = db.collection("user");

    // Create a filter to find the document with the given ObjectId
    let filter = doc! { "_id": object_id };

    // Try to find and delete the document
    match collection.find_one_and_delete(filter, None).await {
        Ok(Some(_)) => {
            // If document was found and deleted, return success JSON
            HttpResponse::Ok().json(json!({ "message": "User deleted successfully!" }))
        }
        Ok(None) => {
            // If no document was found (user doesn't exist), return not found JSON
            HttpResponse::NotFound().json(json!({ "message": "User does not exist" }))
        }
        Err(e) => {
            // If there was an error (e.g., database error), handle it appropriately
            HttpResponse::InternalServerError().body(format!("Error deleting user: {}", e))
        }
    }
}
