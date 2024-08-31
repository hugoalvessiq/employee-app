mod db;
mod employee_handlers;
mod employee_model;
mod login_middleware;
mod login_model;
mod middlewares;
mod user_handler;
mod user_model;

use crate::middlewares::Auth;
use actix_cors::Cors;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_session::{storage::CookieSessionStore, SessionMiddleware};
use actix_web::cookie::time::Duration;
use actix_web::cookie::Key;
use actix_web::{web, App, HttpServer};

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let secret_key = Key::generate();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::ACCEPT,
            ])
            .allowed_header(actix_web::http::header::CONTENT_TYPE)
            .max_age(3600)
            .supports_credentials();

        App::new()
            .wrap(cors)
            .wrap(SessionMiddleware::new(
                CookieSessionStore::default(),
                secret_key.clone(),
            ))
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&[0; 32])
                    .name("auth-cookie")
                    .secure(false)
                    .max_age(Duration::new(30 * 24 * 60 * 60, 0)), // 30 days in seconds
            ))
            .route("/register", web::post().to(user_handler::register_user))
            .route("/login", web::post().to(login_middleware::login_user))
            .route("/logout", web::post().to(login_middleware::logout_user))
            .service(
                web::scope("/protected")
                    .wrap(Auth) // Add middleware Auth
                    .route(
                        "/employee/{id}",
                        web::get().to(employee_handlers::get_employee),
                    )
                    .route(
                        "/employees",
                        web::get().to(employee_handlers::get_employees),
                    )
                    .route(
                        "/employee",
                        web::post().to(employee_handlers::create_employee),
                    )
                    .route(
                        "/employee/{id}",
                        web::put().to(employee_handlers::update_employee),
                    )
                    .route(
                        "/employee/{id}",
                        web::delete().to(employee_handlers::delete_employee),
                    )
                    .route("/user", web::get().to(user_handler::get_user_single))
                    .route("/user/{id}", web::delete().to(user_handler::delete_user)),
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await?;

    Ok(())
}
