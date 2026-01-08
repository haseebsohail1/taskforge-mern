# User Journey

This project supports three roles: **admin**, **lead**, and **member**. The flow below describes how each role uses the system end-to-end.

## Admin Journey
1) **Login**
- Admin logs in via `/login`.
- Header shows `Dashboard` + `Admin` links and the user chip includes role.

2) **Admin Dashboard** (`/admin`)
- Create new users (member or lead).
- Update user roles.
- Add users to teams.
- View total users (stats).

3) **Teams**
- Admin can create teams with name + description + members (multi-select).
- Admin is the creator by default and can delete any team.

4) **Tasks**
- Admin can create tasks for any team.
- Admin can assign tasks to any non-admin member.
- Admin can also assign tasks to self.

## Lead Journey
1) **Login**
- Lead logs in via `/login`.
- Header shows `Dashboard`, `Tasks`, and `Teams`.

2) **Teams**
- Lead can view teams they belong to.
- Lead can add members to their teams.
- Lead can delete teams they created.

3) **Tasks**
- Lead can create tasks for their own teams.
- Lead can assign tasks only to members.

## Member Journey
1) **Login**
- Member logs in via `/login`.
- Header shows `Dashboard` and `Tasks` only.

2) **Dashboard**
- Member sees a column layout by status (todo, in_progress, review, done).
- Only tasks assigned to the member are shown.
- Member can change task status only.

3) **Tasks**
- Member sees assigned tasks only.
- Member can only update status (no full edit/create).

## Role Rules Summary
- **Admin**: full access, can create users, teams, and tasks; can assign to any non-admin and self.
- **Lead**: can create tasks for their teams; can assign only to members; can manage their teams.
- **Member**: can only update status on assigned tasks; no team management.
