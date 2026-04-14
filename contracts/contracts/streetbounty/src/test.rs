#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn report_and_read_incidents() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reward_token = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.init(&admin, &reward_token);

    let id = client.report_incident(
        &reporter,
        &String::from_str(&env, "Pothole"),
        &String::from_str(&env, "Large pothole near signal"),
        &String::from_str(&env, "Main Street"),
    );

    assert_eq!(id, 0);
    assert_eq!(client.get_incident_count(), 1);

    let incident = client.get_incident(&0);
    assert_eq!(incident.id, 0);
    assert_eq!(incident.reporter, reporter);
    assert_eq!(incident.status, IncidentStatus::Pending);

    let latest = client.get_latest_incident();
    assert_eq!(latest.id, 0);
}

#[test]
#[should_panic(expected = "already initialized")]
fn init_only_once() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reward_token = Address::generate(&env);

    client.init(&admin, &reward_token);
    client.init(&admin, &reward_token);
}

#[test]
#[should_panic(expected = "Error(Auth, InvalidAction)")]
fn approve_requires_admin_auth() {
    let env = Env::default();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reward_token = Address::generate(&env);
    let reporter = Address::generate(&env);

    env.mock_all_auths();
    client.init(&admin, &reward_token);
    client.report_incident(
        &reporter,
        &String::from_str(&env, "Garbage"),
        &String::from_str(&env, "Garbage not collected"),
        &String::from_str(&env, "2nd Avenue"),
    );

    env.set_auths(&[]);
    client.approve_incident(&0);
}
