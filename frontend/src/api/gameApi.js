import { httpJson } from "./http.js"

export function apiRandomRound() {
  return httpJson("/api/round/random", {
    method: "GET",
  })
}

export function apiSubmitRound({ token, round_id, selected_text, time_taken }) {
  return httpJson("/api/round/submit", {
    method: "POST",
    token,
    body: { round_id, selected_text, time_taken },
  })
}

export function apiMyResults({ token }) {
  return httpJson("/api/my/results", {
    method: "GET",
    token,
  })
}
