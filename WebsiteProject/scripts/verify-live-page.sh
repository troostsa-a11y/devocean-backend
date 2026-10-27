#!/usr/bin/env bash
# Read-only smoke check, shared by deploy.sh and isolated regression tests.
# Source this file, then call verify_live_page BASE PATH BUILD_MARKER IS_GUIDE.
# Do not build, publish, change secrets, or send alerts from this helper.

verify_live_page() {
  local base="${1%/}" path="$2" marker="$3" is_guide="${4:-0}"
  local url="${base}${path}" response status body target
  local cancellation_flag='[?&]canceled=([^&#]*)'
  local curl_options=(
    --silent --show-error --no-location --connect-timeout 10 --max-time 30
    --header 'Accept: text/html' --header 'Cache-Control: no-cache'
  )
  LIVE_VERIFY_ERROR=""
  if [[ -z "$marker" ]]; then
    LIVE_VERIFY_ERROR="build marker is missing from verification inputs"
    return 1
  fi

  if [[ "$path" == "/canceled" || "$path" == "/canceled.html" ]]; then
    # These are intentionally bodyless redirects, not HTML documents. Check
    # their bare URLs so a query string cannot hide stale static-file routing.
    if ! response=$(curl "${curl_options[@]}" --output /dev/null \
      --write-out $'%{http_code}\n%{redirect_url}' "$url"); then
      LIVE_VERIFY_ERROR="cancellation redirect request failed"
      return 1
    fi
    status="${response%%$'\n'*}"
    target="${response#*$'\n'}"
    if [[ "$status" != "303" ]]; then
      LIVE_VERIFY_ERROR="expected cancellation redirect HTTP 303, received HTTP $status"
      return 1
    fi
    # Never follow arbitrary redirects, including an Access login or homepage.
    # curl's redirect_url resolves relative Location headers to absolute URLs.
    if [[ "$target" != "${base}/book-direct?"* ]] ||
      ! [[ "$target" =~ $cancellation_flag ]] ||
      [[ "${BASH_REMATCH[1]}" != "1" ]]; then
      LIVE_VERIFY_ERROR="cancellation redirect has an unexpected destination or state"
      return 1
    fi
    url="$target"
  elif [[ "$is_guide" != "1" ]]; then
    url+="?smoke=$(date +%s)"
  fi

  if ! response=$(curl "${curl_options[@]}" --fail \
    --write-out $'\n%{http_code}' "$url"); then
    LIVE_VERIFY_ERROR="HTML request failed"
    return 1
  fi
  status="${response##*$'\n'}"
  body="${response%$'\n'*}"
  if [[ "$status" != "200" ]]; then
    LIVE_VERIFY_ERROR="expected HTML HTTP 200, received HTTP $status"
    return 1
  fi
  if [[ "$is_guide" == "1" && "$body" == *"shared-nav.js"* ]]; then
    LIVE_VERIFY_ERROR="old standalone guide HTML is still being served"
    return 1
  fi
  if [[ "$body" != *"$marker"* ]]; then
    LIVE_VERIFY_ERROR="expected build marker is missing from HTML"
    return 1
  fi
}
