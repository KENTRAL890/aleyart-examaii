# CHANGELOG — ALEYART EXAMAI PRO

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] — 2025-06-01 — Initial Production Release

### Added
- Complete AI-powered examination generation using Anthropic Claude
- Full GES/NaCCA/SBC/CCP curriculum compliance
- Role-Based Access Control: Administrator, Headteacher, Examination Officer, Teacher
- All 14 educational classes (Creche through Basic 9)
- All 12 subjects for Primary and JHS
- 13 question types supported
- Section A (two-column MCQ with divider) and Section B+ (subjective)
- Mandatory exact-answer marking schemes — never "suggested answers"
- OMR sheet generation with interactive bubbles
- School-branded answer booklets (Standard, Lined, Graph Paper)
- School-wide shared examination repository
- Permanent question bank with full metadata
- Student management with parent/guardian records
- Teacher management with class/subject assignment
- GES-compliant grading system (A1 through F)
- PDF, DOCX, XLSX export
- Print-ready A4 exam paper layout
- Docker + Docker Compose deployment
- GitHub Actions CI/CD pipeline
- Nginx reverse proxy configuration
- PM2 process management
- Ubuntu deployment script
- JWT authentication with refresh tokens
- bcrypt password hashing (12 rounds)
- Rate limiting on all endpoints
- Helmet security headers
- Special subject rules:
  - Computing Q1: Practical (compulsory)
  - Science Q1: Practical (compulsory)
  - Career Technology Q1: Practical (compulsory)
  - Creative Arts and Design Q1: Practical (compulsory)
  - RME Q1: Story/scenario-based (70% rule)
  - English JHS: Grammar/Comprehension/Summary/Composition/Literature structure
- Early Childhood protection: no formal exams for Creche–KG2
- Automatic answer regeneration when questions are edited
- Automatic marks recalculation
- Audit logging for all critical actions
- Database seed with default classes, subjects, users
