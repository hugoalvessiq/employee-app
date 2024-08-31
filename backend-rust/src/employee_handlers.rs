use crate::db;
use crate::employee_model::Employee;
use actix_web::{web, HttpResponse, Responder};
use futures::stream::StreamExt;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Bson, Document};
use serde::Deserialize;
use serde_json::json;

// import the Deserialize macro
#[derive(Deserialize)]
pub struct SearchQuery {
    q: Option<String>,
}

// #[get("/employee/{id}")]
pub async fn get_employee(id: web::Path<String>) -> impl Responder {
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
    let collection: mongodb::Collection<Document> = db.collection("employee");

    let filter = doc! { "_id": object_id };
    match collection.find_one(filter, None).await {
        Ok(Some(doc)) => {
            let id_string = doc
                .get("_id")
                .and_then(|id| id.as_object_id())
                .map(|oid| oid.to_hex());
            let mut employee: Employee = bson::from_bson::<Employee>(Bson::Document(doc)).unwrap();
            employee.id = Some(id_string.unwrap());

            return HttpResponse::Ok().json(employee);
        }
        Ok(None) => {
            // If no document was found (user doesn't exist), return not found JSON
            HttpResponse::NotFound().json(json!({ "message": "User does not exist" }))
        }
        Err(_) => todo!(),
    }
}

// #[get("/employee")]
pub async fn get_employees(query: web::Query<SearchQuery>) -> impl Responder {
    let db = db::get_database_connection().await.unwrap();
    let collection: mongodb::Collection<Document> = db.collection("employee");

    let filter = match &query.q {
        Some(q) => {
            doc! {
                "$or": [
                    { "name": { "$regex": q, "$options": "i" } }, // Search by case-insensitive name
                    { "position": { "$regex": q, "$options": "i" } } // Case-insensitive position search
                ]
            }
        }
        None => {
            doc! {} // No filter, search all documents
        }
    };

    let mut cursor = collection.find(filter, None).await.unwrap();
    let mut employees: Vec<Employee> = Vec::new();

    while let Some(result) = cursor.next().await {
        match result {
            Ok(document) => {
                if let Ok(employee) = bson::from_bson::<Employee>(Bson::Document(document.clone()))
                {
                    let id_string = document
                        .get("_id")
                        .and_then(|id| id.as_object_id())
                        .map(|oid| oid.to_hex());

                    let mut employee_with_string_id = employee;
                    employee_with_string_id.id = id_string;
                    employees.push(employee_with_string_id);
                }
            }
            _ => {}
        }
    }

    HttpResponse::Ok().json(employees)
}

// #[post("/employee")]
pub async fn create_employee(employee: web::Json<Employee>) -> impl Responder {
    let db = db::get_database_connection().await.unwrap();
    let collection: mongodb::Collection<Document> = db.collection("employee");

    // Convert the "name" and "position" fields to lowercase
    let lowercase_name = employee.name.trim().to_lowercase();
    let lowercase_position = employee.position.trim().to_lowercase();

    // Check if an exact match for name already exists in the database
    let filter_name = doc! {
        "name": &lowercase_name
    };

    // Check if an exact match for contact already exists in the database
    let filter_contact = doc! {
        "contact": &employee.contact
    };

    // Try to find a document that matches the filter for name
    if let Some(_) = collection
        .find_one(filter_name.clone(), None)
        .await
        .unwrap()
    {
        // If a document with the same exact name already exists, return error message
        return HttpResponse::Conflict()
            .json(json!({ "message": "Name already exists in the database" }));
    }

    // Try to find a document that matches the filter for contact
    if let Some(_) = collection
        .find_one(filter_contact.clone(), None)
        .await
        .unwrap()
    {
        // If a document with the same exact contact already exists, return error message
        return HttpResponse::Conflict()
            .json(json!({ "message": "Contact already exists in the database!" }));
    }

    // If no existing document found, proceed with insertion
    let doc = doc! {
        "name": &lowercase_name,
        "age": employee.age,
        "position": &lowercase_position,
        "salary": employee.salary,
        "contact": &employee.contact,
        "promotions": employee.promotions.iter().map(|p| p.to_document()).collect::<Vec<_>>(),
        "admission_date": &employee.admission_date,
    };

    // Insert the new document into the collection
    collection.insert_one(doc, None).await.unwrap();

    // Return success response with the inserted employee data
    HttpResponse::Created().json(employee.0)
}

// #[put("/employee/{id}")]
pub async fn update_employee(
    id: web::Path<String>,
    employee: web::Json<Employee>,
) -> impl Responder {
    let db = db::get_database_connection().await.unwrap();
    let collection: mongodb::Collection<Document> = db.collection("employee");

    let object_id = ObjectId::parse_str(&id.into_inner()).unwrap();
    let filter = doc! { "_id": object_id };

    // Convert the "name" and "position" fields to lowercase
    let lowercase_name = employee.name.trim().to_lowercase();
    let lowercase_position = employee.position.trim().to_lowercase();

    // Check if an exact match for name already exists in the database
    let filter_name = doc! {
        "name": &lowercase_name,
        "_id": { "$ne": object_id } // Excludes the employee himself from the search
    };

    // Check if an exact match for contact already exists in the database
    let filter_contact = doc! {
        "contact": &employee.contact,
        "_id": { "$ne": object_id } // Excludes the employee himself from the search
    };

    // Try to find a document that matches the filter for name
    if let Some(_) = collection
        .find_one(filter_name.clone(), None)
        .await
        .unwrap()
    {
        // If a document with the same exact name already exists, return error message
        return HttpResponse::Conflict()
            .json(json!({ "message": "Name already exists in the database" }));
    }

    // Try to find a document that matches the filter for contact
    if let Some(_) = collection
        .find_one(filter_contact.clone(), None)
        .await
        .unwrap()
    {
        // If a document with the same exact contact already exists, return error message
        return HttpResponse::Conflict()
            .json(json!({ "message": "Contact already exists in the database!" }));
    }

    let update = doc! {
        "$set": {
            "name": &lowercase_name,
            "age": employee.age,
            "position": &lowercase_position,
            "salary": employee.salary,
            "contact": &employee.contact,
            "promotions": employee.promotions.iter().map(|p| p.to_document()).collect::<Vec<_>>(),
            "admission_date": &employee.admission_date,
        }
    };

    collection.update_one(filter, update, None).await.unwrap();

    HttpResponse::Ok().json(employee.0)
}

// #[delete("/employee/{id}")]
pub async fn delete_employee(id: web::Path<String>) -> impl Responder {
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
    let collection: mongodb::Collection<Document> = db.collection("employee");

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
