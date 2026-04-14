#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec,
};

#[contract]
pub struct Contract;

const ONE_XLM_STROOPS: i128 = 10_000_000;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    RewardToken,
    NextIncidentId,
    Incident(u64),
}

#[derive(Clone, Debug, PartialEq, Eq)]
#[contracttype]
pub enum IncidentStatus {
    Pending,
    Approved,
    Disapproved,
}

#[derive(Clone)]
#[contracttype]
pub struct Incident {
    pub id: u64,
    pub reporter: Address,
    pub title: String,
    pub description: String,
    pub location: String,
    pub created_at: u64,
    pub status: IncidentStatus,
}

fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .unwrap_or_else(|| panic!("contract is not initialized"))
}

fn get_reward_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::RewardToken)
        .unwrap_or_else(|| panic!("reward token is not configured"))
}

fn get_next_incident_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextIncidentId)
        .unwrap_or(0)
}

fn get_incident_or_panic(env: &Env, id: u64) -> Incident {
    env.storage()
        .persistent()
        .get(&DataKey::Incident(id))
        .unwrap_or_else(|| panic!("incident not found"))
}

fn require_non_empty(field: &str, value: &String) {
    if value.len() == 0 {
        panic!("{} cannot be empty", field);
    }
}

fn pay_reward(env: &Env, reporter: &Address) {
    let reward_token = get_reward_token(env);
    let token_client = token::Client::new(env, &reward_token);
    token_client.transfer(&env.current_contract_address(), reporter, &ONE_XLM_STROOPS);
}

#[contractimpl]
impl Contract {
    pub fn init(env: Env, admin: Address, reward_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RewardToken, &reward_token);
        env.storage().instance().set(&DataKey::NextIncidentId, &0_u64);
    }

    pub fn report_incident(
        env: Env,
        reporter: Address,
        title: String,
        description: String,
        location: String,
    ) -> u64 {
        reporter.require_auth();
        require_non_empty("title", &title);
        require_non_empty("description", &description);
        require_non_empty("location", &location);

        let id = get_next_incident_id(&env);
        let incident = Incident {
            id,
            reporter,
            title,
            description,
            location,
            created_at: env.ledger().timestamp(),
            status: IncidentStatus::Pending,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Incident(id), &incident);
        env.storage()
            .instance()
            .set(&DataKey::NextIncidentId, &(id + 1));

        id
    }

    pub fn get_incident(env: Env, id: u64) -> Incident {
        get_incident_or_panic(&env, id)
    }

    pub fn get_all_incidents(env: Env) -> Vec<Incident> {
        let total = get_next_incident_id(&env);
        let mut incidents = Vec::new(&env);

        let mut i = 0_u64;
        while i < total {
            let incident = get_incident_or_panic(&env, i);
            incidents.push_back(incident);
            i += 1;
        }

        incidents
    }

    pub fn get_latest_incident(env: Env) -> Incident {
        let total = get_next_incident_id(&env);
        if total == 0 {
            panic!("no incidents reported yet");
        }

        get_incident_or_panic(&env, total - 1)
    }

    pub fn get_incident_count(env: Env) -> u64 {
        get_next_incident_id(&env)
    }

    pub fn approve_incident(env: Env, id: u64) {
        let admin = get_admin(&env);
        admin.require_auth();

        let mut incident = get_incident_or_panic(&env, id);
        if incident.status != IncidentStatus::Pending {
            panic!("incident already reviewed");
        }

        incident.status = IncidentStatus::Approved;
        env.storage()
            .persistent()
            .set(&DataKey::Incident(id), &incident);

        pay_reward(&env, &incident.reporter);
    }

    pub fn disapprove_incident(env: Env, id: u64) {
        let admin = get_admin(&env);
        admin.require_auth();

        let mut incident = get_incident_or_panic(&env, id);
        if incident.status != IncidentStatus::Pending {
            panic!("incident already reviewed");
        }

        incident.status = IncidentStatus::Disapproved;
        env.storage()
            .persistent()
            .set(&DataKey::Incident(id), &incident);
    }

    pub fn fund_contract(env: Env, from: Address, amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }

        from.require_auth();
        let reward_token = get_reward_token(&env);
        let token_client = token::Client::new(&env, &reward_token);
        token_client.transfer(&from, &env.current_contract_address(), &amount);
    }

    pub fn contract_balance(env: Env) -> i128 {
        let reward_token = get_reward_token(&env);
        let token_client = token::Client::new(&env, &reward_token);
        token_client.balance(&env.current_contract_address())
    }

    pub fn withdraw_contract_funds(env: Env, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let admin = get_admin(&env);
        admin.require_auth();

        let reward_token = get_reward_token(&env);
        let token_client = token::Client::new(&env, &reward_token);
        token_client.transfer(&env.current_contract_address(), &to, &amount);
    }

    pub fn get_admin(env: Env) -> Address {
        get_admin(&env)
    }

    pub fn get_reward_token(env: Env) -> Address {
        get_reward_token(&env)
    }
}

mod test;
