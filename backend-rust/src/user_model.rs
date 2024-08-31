use bson::doc;
use chrono::prelude::*;
use mongodb::bson::Document;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub id: Option<String>,
    pub name: String,
    pub password: String,
    pub roles: Vec<Roles>,
    pub create_date: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserWithoutPassword {
    pub id: Option<String>,
    pub name: String,
    pub roles: Vec<Roles>,
    // Add any other fields you want to include in the response
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Roles {
    // pub date: String,
    pub roles: String,
}

impl Roles {
    // Converts the Roles structure to a Document (Bson)
    pub fn to_document(&self) -> Document {
        doc! {
            "date": get_current_date(),
            "roles": &self.roles,
        }
    }
}

fn get_current_date() -> String {
    let now = Local::now();
    now.format("%Y-%m-%d").to_string()
}
