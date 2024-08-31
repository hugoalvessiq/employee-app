use bson::doc;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Login {
    pub id: Option<String>,
    pub name: String,
    pub password: String,
}
