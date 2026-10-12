#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://localhost:5000}"
OWNER="${GITHUB_OWNER:-alqinai}"
REPO="${GITHUB_REPO:-expressBookReviews}"
mkdir -p evidence
capture() {
  local name="$1"; shift
  printf 'curl' > "evidence/$name"
  printf ' %q' "$@" >> "evidence/$name"
  printf '\n' >> "evidence/$name"
  curl --fail-with-body -sS "$@" >> "evidence/$name"
  printf '\n' >> "evidence/$name"
}
# GitHub fork proof; the displayed cURL command is the command actually executed.
printf 'curl -sS https://api.github.com/repos/%s/%s\n' "$OWNER" "$REPO" > evidence/githubrepo
curl --fail-with-body -sS "https://api.github.com/repos/$OWNER/$REPO" | node -e "let d='';process.stdin.on('data',x=>d+=x).on('end',()=>{let obj=JSON.parse(d);console.log('parent.clone_url:',obj.parent?.clone_url||'ERROR: repository is not a fork')})" >> evidence/githubrepo
capture getallbooks "$BASE/"
capture getbooksbyISBN "$BASE/isbn/1"
capture getbooksbyauthor "$BASE/author/Jane%20Austen"
capture getbooksbytitle "$BASE/title/Pride%20and%20Prejudice"
capture getbookreview "$BASE/review/1"
USERNAME="student_$(date +%s)"
PASSWORD='demo-password-123'
capture register -H 'Content-Type: application/json' -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" "$BASE/register"
LOGIN=$(curl --fail-with-body -sS -H 'Content-Type: application/json' -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" "$BASE/customer/login")
printf 'curl -sS -H %q -d %q %q\n%s\n' 'Content-Type: application/json' "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" "$BASE/customer/login" "$LOGIN" > evidence/login
TOKEN=$(printf '%s' "$LOGIN" | node -e "let d='';process.stdin.on('data',x=>d+=x).on('end',()=>console.log(JSON.parse(d).token||''))")
if [ -z "$TOKEN" ]; then echo 'Login did not return token'; exit 1; fi
capture reviewadded -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"review":"Excellent book for this assignment."}' "$BASE/customer/auth/review/1"
capture deletereview -X DELETE -H "Authorization: Bearer $TOKEN" "$BASE/customer/auth/review/1"
echo 'Evidence created in evidence/. Keep evidence private because it includes an authentication token.'
