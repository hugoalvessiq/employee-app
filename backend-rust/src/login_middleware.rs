use crate::db;

use crate::login_model::Login;
use actix_identity::Identity;
use actix_web::{web, HttpResponse, Responder};
use bcrypt::verify;
use jsonwebtoken::encode;
use jsonwebtoken::EncodingKey;
use jsonwebtoken::Header;
use mongodb::bson::{doc, Document};
use serde_json::json;
extern crate dotenv;
use chrono::{Utc, Duration};

use dotenv::dotenv;
use std::env;

pub async fn login_user(user: web::Json<Login>, id: Identity) -> impl Responder {
    let db = db::get_database_connection().await.unwrap();
    let collection: mongodb::Collection<Document> = db.collection("user");

    let filter_name = doc! {
        "name": &user.name.to_lowercase()
    };

    if let Some(user_doc) = collection
        .find_one(filter_name.clone(), None)
        .await
        .unwrap()
    {
        if let Some(stored_password) = user_doc.get_str("password").ok() {
            if verify(&user.password, stored_password).unwrap() {
                // Convert ObjectId to a string
                let user_id = user_doc.get_object_id("_id").unwrap().to_hex();

                // Set the expiration time in seconds (e.g. 7 days = 604800 seconds)
                let expiration_seconds = 7 * 86400;

                let payload = json!({
                    "sub": user_id,
                    "exp": (Utc::now() + Duration::seconds(expiration_seconds)).timestamp() as usize,
                    // Other fields you want to include in the token
                });

                dotenv().ok();

                let secret_key = env::var("SECRET_KEY").unwrap_or_else(|_| {
                    panic!("SECRET_KEY environment variable not set.");
                });

                let token = encode(
                    &Header::default(),
                    &payload,
                    &EncodingKey::from_secret(secret_key.as_ref()),
                )
                .unwrap();

                id.remember(token.clone());

                return HttpResponse::Ok().json(json!({ "token": token }));
            }
        }
    }

    HttpResponse::Unauthorized().json(json!({ "message": "Invalid credentials" }))
}

pub async fn logout_user(id: Identity) -> impl Responder {
    id.forget();
    HttpResponse::Ok().body("User logged out")
}
