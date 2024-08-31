use bson::doc;
use chrono::prelude::*;
use mongodb::bson::Document;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Employee {
    pub id: Option<String>,
    pub name: String,
    pub age: i32,
    pub position: String,
    pub salary: f64,
    pub contact: String,
    pub promotions: Vec<Promotion>,
    pub admission_date: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Promotion {
    pub date: String,
    pub new_position: String,
    pub bonus: Option<f64>,
}

impl Promotion {
    // Converts the Promotion structure to a Document (Bson)
    pub fn to_document(&self) -> Document {
        doc! {
            "date": get_current_date(),
            "new_position": &self.new_position,
            "bonus": self.bonus,
        }
    }
}

fn get_current_date() -> String {
    let now = Local::now();
    now.format("%Y-%m-%d").to_string()
}
