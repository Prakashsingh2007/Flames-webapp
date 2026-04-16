# FLAMES Full-Stack App

Modern FLAMES web application with Django REST backend and React frontend.

## Backend (Django)
Runs at: http://127.0.0.1:8000

## Frontend (React + Vite)
Runs at: http://localhost:5173

## Upgraded Features
- Modern responsive UI with cards, gradients, transitions, and loading states
- Step-by-step FLAMES elimination timeline in result view
- Dynamic relationship explanation from backend
- Result persistence in database with history views
- Token-based authentication with personal history support
- Error handling for empty names, invalid data, and non-alphabetic input
- Dark mode / light mode toggle

## API Endpoints
- POST /api/flames/
	- Input: `{ "name1": "...", "name2": "..." }`
	- Output: result metadata + `relationship` + `explanation` + `elimination_steps`
- GET /api/flames/history/?limit=20
- GET /api/flames/my-results/ (requires auth)
- POST /api/auth/register/
- POST /api/auth/login/
- POST /api/auth/logout/
- GET /api/auth/me/

## Testing
- Backend tests: `python manage.py test flames_app`
- Frontend lint: `npm run lint`

## Notes
- Vite build requires Node.js `20.19+` or `22.12+`.