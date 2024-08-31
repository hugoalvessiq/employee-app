use mongodb::{options::ClientOptions, Client, Database};
extern crate dotenv;

use dotenv::dotenv;
use std::env;

// Function to get a connection to the database
pub async fn get_database_connection() -> Result<Database, mongodb::error::Error> {
    dotenv().ok();

    let mongodb_url = env::var("MONGODB_URL").unwrap_or_else(|_| {
        panic!("Environment variable MONGODB_URL not set.");
    });

    let client_options = ClientOptions::parse(&mongodb_url).await?;
    let client = Client::with_options(client_options)?;
    println!("URL do MongoDB: {}", &mongodb_url);
    Ok(client.database("employee_db"))
}
