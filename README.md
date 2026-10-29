# StudyFlow — fresh full-stack project

A role-based study portal built with React + Vite, Node.js + Express, MongoDB Atlas, REST APIs, JWT authentication, and optional AWS S3 file storage.

## Requirements
- Node.js 20 or newer
- MongoDB Atlas account
- AWS account only if you want actual file uploads to S3

## 1. Install dependencies
From this project root:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

## 2. Configure the backend
Copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.

```bash
cp backend/.env.example backend/.env
```

Never commit `.env` to GitHub.

## 3. Create the first faculty account
In `backend/.env`, set `INITIAL_FACULTY_NAME`, `INITIAL_FACULTY_EMAIL`, and `INITIAL_FACULTY_PASSWORD`, then run:

```bash
npm run seed:faculty --prefix backend
```

This creates a faculty account if that email does not already exist. Public registration always creates a student; users cannot choose their own role.

## 4. Run the application
From the project root:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend health check: http://localhost:5001/api/health

## Roles
- Students can view courses and study materials.
- Faculty can create, edit, and delete courses and study-material records.
- All write permissions are checked by the backend, not just by the UI.

## Study material files
The app stores study-material metadata in MongoDB. For real PDF/file uploads, configure the optional S3 settings in `backend/.env`; the backend then issues short-lived presigned upload URLs and stores the resulting S3 URL with the material record. File binaries should live in S3, not inside MongoDB documents.

## Main REST endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/courses`, `GET /api/courses/:id`
- `POST /api/courses`, `PUT /api/courses/:id`, `DELETE /api/courses/:id` (faculty)
- `GET /api/materials`, `GET /api/materials/:id`
- `POST /api/materials/upload-url` (faculty; S3 configured)
- `POST /api/materials`, `PUT /api/materials/:id`, `DELETE /api/materials/:id` (faculty)

## Deployment plan for the three subjects
1. Full Stack: run locally and demonstrate React, Express, MongoDB, JWT, and CRUD.
2. Web Services: demonstrate endpoints and responses in Postman or Thunder Client.
3. Cloud: deploy frontend as a static site (S3 + CloudFront), backend on an AWS compute service, MongoDB Atlas as the database, and materials in S3. Use environment variables and least-privilege IAM. Do not expose secrets in the frontend.

## Final presentation pass
- Light, dark, and system appearance modes are available under **Settings → Appearance** and persist on the device.
- Seeded courses now have fuller descriptions, and seeded learning resources link to official documentation so the materials page is useful before your course PDFs are added.
- For your five course PDFs, attach them in the ChatGPT conversation. They can be included in the project as clickable study-material resources. For AWS deployment, use S3 for file storage rather than storing PDF bytes in MongoDB.

## If the site shows “Could not load courses/materials” or “Unable to continue”
Those messages mean the frontend cannot reach a working backend API. Keep the API terminal running and check `http://localhost:5001/api/health`; its JSON should say `"database":"connected"`. If the backend exits, check `backend/.env` for a valid `MONGODB_URI` and a `JWT_SECRET` of at least 32 characters, and confirm your current IP is allowed in MongoDB Atlas Network Access. Do not put `.env` into GitHub.
