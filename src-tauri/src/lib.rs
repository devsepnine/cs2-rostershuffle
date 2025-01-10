use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct IPlayer {
    pub name: String,
    pub premier_score: f64,
    pub kd: f64,
    pub hltv_rating: f64,
    pub win_rate: f64,
    pub headshot_percentage: f64,
    pub adr: f64,
    pub check: bool,
    pub custom_elo: f64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TeamResult {
    pub team_ct: Vec<IPlayer>,
    pub team_t: Vec<IPlayer>,
}

fn get_combinations(players: &[IPlayer], size: usize) -> Vec<Vec<IPlayer>> {
    if size == 0 {
        return vec![vec![]];
    }
    if players.is_empty() {
        return vec![];
    }

    let mut combinations = vec![];
    let first = &players[0];
    let rest = &players[1..];

    for mut combo in get_combinations(rest, size - 1) {
        let mut with_first = vec![first.clone()];
        with_first.append(&mut combo);
        combinations.push(with_first);
    }

    combinations.extend(get_combinations(rest, size));
    combinations
}

fn balance_teams(players: Vec<IPlayer>, max_allowed_difference: f64) -> TeamResult {
    // 1. 플레이어 정렬
    let mut players_sorted = players.clone();
    players_sorted.sort_by(|a, b| b.custom_elo.partial_cmp(&a.custom_elo).unwrap());

    // 2. 상위와 하위 플레이어 분리
    let top_two = players_sorted.iter().take(2).cloned().collect::<Vec<_>>();
    let bottom_two = players_sorted
        .iter()
        .rev()
        .take(2)
        .cloned()
        .collect::<Vec<_>>();
    let remaining_players = players_sorted
        .iter()
        .skip(2)
        .take(players_sorted.len() - 4)
        .cloned()
        .collect::<Vec<_>>();

    // 3. 상위 및 하위 플레이어 할당
    let top_assignments = vec![
        (vec![top_two[0].clone()], vec![top_two[1].clone()]),
        (vec![top_two[1].clone()], vec![top_two[0].clone()]),
    ];

    let bottom_assignments = vec![
        (vec![bottom_two[0].clone()], vec![bottom_two[1].clone()]),
        (vec![bottom_two[1].clone()], vec![bottom_two[0].clone()]),
    ];

    let mut best_split: Option<TeamResult> = None;
    let mut min_difference = f64::MAX;
    let mut acceptable_splits = vec![];

    let team_size = players.len() / 2;

    for top_assign in &top_assignments {
        for bottom_assign in &bottom_assignments {
            let initial_team_a = [&top_assign.0[..], &bottom_assign.0[..]].concat();
            let initial_team_b = [&top_assign.1[..], &bottom_assign.1[..]].concat();
            let remaining_team_a_size = team_size - initial_team_a.len();

            let combinations = get_combinations(&remaining_players, remaining_team_a_size);

            for combo in combinations {
                let current_team_a = [&initial_team_a[..], &combo[..]].concat();
                let current_team_b = remaining_players
                    .iter()
                    .filter(|p| !combo.contains(p))
                    .cloned()
                    .chain(initial_team_b.iter().cloned())
                    .collect::<Vec<_>>();

                // 4. 각 팀의 점수 합산
                let team_a_sum: f64 = current_team_a.iter().map(|p| p.custom_elo).sum();
                let team_b_sum: f64 = current_team_b.iter().map(|p| p.custom_elo).sum();
                let difference = (team_a_sum - team_b_sum).abs();

                // 5. 최소 차이 업데이트
                if difference < min_difference {
                    min_difference = difference;
                    best_split = Some(TeamResult {
                        team_ct: current_team_a.clone(),
                        team_t: current_team_b.clone(),
                    });
                }

                // 허용 가능한 분할 수집
                if difference <= max_allowed_difference {
                    acceptable_splits.push(TeamResult {
                        team_ct: current_team_a.clone(),
                        team_t: current_team_b.clone(),
                    });
                }
            }
        }
    }

    // 6. 허용 가능한 분할 중 무작위 선택
    if !acceptable_splits.is_empty() {
        let selected = acceptable_splits
            .choose_mut(&mut rand::thread_rng())
            .unwrap();
        return selected.clone();
    }

    // 허용 가능한 분할이 없으면 최적의 분할 반환
    best_split.unwrap_or(TeamResult {
        team_ct: vec![],
        team_t: vec![],
    })
}

#[tauri::command]
async fn balance_teams_async(players: Vec<IPlayer>, max_allowed_difference: f64) -> TeamResult {
    tokio::task::spawn_blocking(move || balance_teams(players, max_allowed_difference))
        .await
        .unwrap_or_else(|_| TeamResult {
            team_ct: vec![],
            team_t: vec![],
        })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let splashscreen_window = app.get_webview_window("splashscreen").unwrap();
            let main_window = app.get_webview_window("main").unwrap();
            std::thread::spawn(move || {
                std::thread::sleep(Duration::from_secs(3));
                main_window.show().unwrap();
                splashscreen_window.close().unwrap();
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![balance_teams_async])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
