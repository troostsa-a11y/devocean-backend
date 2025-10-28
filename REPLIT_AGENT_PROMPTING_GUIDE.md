# Replit Agent Prompting Guide
**How to Effectively Communicate with Replit Agent**  
**Last Updated:** October 28, 2025

---

## 🎯 Overview

Replit Agent is an AI-powered development assistant that helps you build and maintain applications using natural language. This guide shows you how to communicate effectively with Agent to get the best results.

---

## 📋 Core Principles

### 1. **Be Specific**
❌ **Vague:** "Make a website"  
✅ **Specific:** "Create a simple portfolio website with sections for Home, About Me, and Contact Form. Use a clean, modern design theme and placeholder content."

❌ **Vague:** "Fix the email system"  
✅ **Specific:** "The email automation server isn't processing Beds24 booking emails. Check the IMAP connection and verify the email parsing logic in server/emailProcessor.ts"

### 2. **Provide Context**
Include relevant information:
- **Files:** Mention specific files using `@filename`
- **URLs:** Provide links to documentation or examples
- **Error Messages:** Copy exact error text
- **What You've Tried:** Explain previous troubleshooting steps

**Example:**
```
The booking form on /reservations page isn't submitting. 
Error in browser console: "Cannot POST /api/bookings"
I've checked client/src/pages/ReservationsPage.tsx and the form action looks correct.
```

### 3. **Start Simple and Iterate**
Break complex projects into smaller steps:

❌ **Too Complex:**
```
Build a complete hotel booking system with multi-language support, 
payment processing, email automation, admin dashboard, and SEO optimization.
```

✅ **Iterative Approach:**
```
Step 1: "Create a basic booking form with name, email, dates, and room type"
Step 2: "Add form validation and error handling"
Step 3: "Integrate with Beds24 API for availability"
Step 4: "Add multi-language support using i18next"
...and so on
```

### 4. **Use Positive Language**
Focus on what you **want**, not what to avoid:

❌ **Negative:** "Don't make the user profile page confusing"  
✅ **Positive:** "Design a clean, intuitive user profile page"

❌ **Negative:** "Make sure it doesn't break the database"  
✅ **Positive:** "Use safe database migrations with `npm run db:push`"

### 5. **Show Examples**
Reduce ambiguity with concrete examples:

- **Code snippets:** "Make it work like this: `const result = processBooking(data)`"
- **Output formats:** "Return JSON like: `{ success: true, bookingId: 123 }`"
- **UI mockups:** Upload screenshots or attach images
- **Sample data:** "Use this test data: `{ name: 'John', email: 'john@example.com' }`"

### 6. **Simplify Your Language**
- Use clear, straightforward language
- Break complex ideas into bullet points
- Avoid unnecessary jargon
- Use technical terms only when needed

❌ **Complex:**
```
Implement a polymorphic persistence layer with dependency injection 
for the booking entity utilizing the repository pattern.
```

✅ **Simple:**
```
Create a database storage interface for bookings:
- Save new bookings
- Get booking by ID
- List all bookings
Use the existing storage.ts pattern
```

### 7. **Specify Requirements**
Clearly define:
- **Output formats:** "Return a CSV file" or "Display as a table"
- **Constraints:** "Use only the Resend API, not Nodemailer"
- **Libraries:** "Use Tailwind CSS for styling"
- **Edge cases:** "Handle case when email is empty"

### 8. **Test Your Assumptions**
Plan before prompting:
- Outline key features
- Define data structures
- Map user flows
- Identify dependencies

---

## 🛠️ Effective Prompting Strategies

### **Strategy 1: Checkpoint Progress**
Break work into testable steps and verify each one:

```
1. "Create database schema for bookings table"
   → Test: Verify schema is correct
   
2. "Add API endpoint to save bookings"
   → Test: Use curl to test endpoint
   
3. "Create booking form in frontend"
   → Test: Submit form and check database
```

**Use Checkpoints:** Agent creates automatic checkpoints. Use them to safely experiment!

### **Strategy 2: Debug with Detail**
When errors occur, provide:
- **Exact error message:** Full stack trace
- **Relevant code:** File name and line number
- **Steps to reproduce:** What you did before the error
- **What you've checked:** Previous troubleshooting

**Example:**
```
Getting error when starting email server:

Error: connect ECONNREFUSED 127.0.0.1:5432
    at server/storage.ts:15

I've checked:
- DATABASE_URL is set in Replit Secrets
- Database exists in Supabase
- Can connect using psql from terminal

Please help debug the connection issue.
```

### **Strategy 3: Discover Options**
Ask Agent for recommendations:

```
"What's the best way to implement real-time notifications in this app?"
"Which email service should I use: Resend, SendGrid, or Nodemailer?"
"Recommend a good library for PDF generation in Node.js"
```

### **Strategy 4: Experiment and Refine**
Prompting is iterative. If the result isn't right:

1. **Rephrase:** Try different wording
2. **Add detail:** Provide more context
3. **Simplify:** Break into smaller steps
4. **Show example:** Demonstrate what you want

**Example Iteration:**
```
First try: "Add a button"
Not quite right → "Add a blue button that says 'Submit'"
Still not right → "Add a primary button with text 'Submit' that calls handleSubmit() when clicked"
```

### **Strategy 5: Select Relevant Context**
- **Use @mentions:** Reference specific files
- **Start new chats:** For completely different tasks
- **Remove noise:** Don't include irrelevant details

**Example:**
```
In @client/src/pages/BookingPage.tsx, update the date picker 
to disable past dates and weekends.
```

---

## 📁 Using replit.md for Preferences

Agent automatically reads `replit.md` to understand your project and preferences. Define:

### **Coding Style:**
```markdown
## Coding Style
- Use TypeScript for all new JavaScript files
- Prefer functional components with hooks over class components
- Use Tailwind CSS for styling, avoid inline styles
- Always add data-testid attributes to interactive elements
```

### **Technology Stack:**
```markdown
## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Express + Node.js
- Database: PostgreSQL (Supabase)
- Email: Resend API
- Internationalization: i18next (16 languages)
```

### **Project-Specific Rules:**
```markdown
## Important Rules
- Never modify vite.config.ts or drizzle.config.ts
- Always use storage interface, never write SQL directly
- Test email automation with test-email.js before deploying
- Use npm run db:push for database migrations
```

### **Communication Preferences:**
```markdown
## Communication
- I prefer detailed explanations
- Show me the code changes before implementing
- Always test changes before marking tasks complete
```

---

## 💡 Real-World Examples

### **Example 1: Adding a New Feature**
```
Add a "Special Requests" field to the booking form:

Requirements:
- Text area, 500 character limit
- Optional field
- Save to database in bookings table
- Display in admin email notifications

Files to update:
- @shared/schema.ts (add column)
- @client/src/pages/BookingPage.tsx (add form field)
- @server/routes.ts (update validation)
- @email_templates/admin_notification.html (show in email)

Test by submitting a booking with special request "Vegetarian meals"
```

### **Example 2: Debugging an Issue**
```
Email automation isn't sending admin notifications:

Error in logs:
"Error sending email: Invalid API key"

What I've checked:
✓ RESEND_API_KEY exists in Replit Secrets
✓ API key is valid (tested in Resend dashboard)
✓ FROM_EMAIL is verified in Resend
✓ server.ts is running without errors

Please check:
1. Is the API key being read correctly?
2. Is the Resend client initialized properly?
3. Are there any rate limits or quota issues?

Relevant file: @server/emailService.ts
```

### **Example 3: Requesting Documentation**
```
Please create a setup guide for the email automation server:

Include:
- System requirements (Node.js version, packages)
- Environment variables needed (with examples)
- Database schema setup instructions
- How to test IMAP connection
- Troubleshooting common errors

Save as EMAIL_SERVER_SETUP_GUIDE.md

Use the same format and detail level as LANGUAGE_SUPPORT.md
```

### **Example 4: Backup Request**
```
Create a complete backup of the project:

Include:
- All source code (exclude node_modules, dist)
- Documentation files (*.md)
- Email templates
- Database schema
- Package configuration

Create tar.gz archive with today's date
Provide instructions for restoring the backup
```

### **Example 5: Asking for Recommendations**
```
I need to implement user authentication for the admin dashboard.

Requirements:
- Simple username/password login
- Session management
- Protect admin routes
- Store credentials securely

What approach do you recommend?
Should I use Replit Auth, build custom auth, or use a third-party service?
```

---

## 🎨 Advanced Techniques

### **1. Use Web URLs for Context**
Agent can scrape web content:
```
Build a contact form styled like this example:
https://example.com/contact

Use similar layout and color scheme but adapt for our branding.
```

### **2. Upload Images**
Attach screenshots or mockups:
```
Create a hero section that looks like the attached design.png
Use similar typography and spacing.
```

### **3. Request Code Reviews**
```
Review @server/emailProcessor.ts for:
- Potential bugs or edge cases
- Code quality and readability
- Performance optimizations
- Security vulnerabilities
```

### **4. Ask for Explanations**
```
Explain how the IMAP email polling works in @server.ts
Include:
- How often it checks for emails
- How it marks emails as processed
- How it handles errors
```

### **5. Request Tests**
```
Create a test plan for the booking form:
- Test form validation (required fields)
- Test date picker (past dates disabled)
- Test submission (verify database record)
- Test email notifications (admin and guest)
```

---

## 🚫 Common Mistakes to Avoid

### ❌ **Too Vague**
```
"Make it better"
"Fix the bug"
"Update the website"
```

### ❌ **Too Much at Once**
```
"Build a complete hotel management system with booking engine, 
payment processing, inventory management, staff scheduling, 
reporting, multi-property support, and mobile apps"
```

### ❌ **Missing Context**
```
"The form doesn't work"
(Which form? What error? What did you try?)
```

### ❌ **Negative Instructions**
```
"Don't break the database"
"Avoid making it slow"
"Don't use bad practices"
```

### ❌ **Assuming Knowledge**
```
"Update the thing we discussed yesterday"
(Agent doesn't remember previous sessions)
```

---

## ✅ Best Practices Checklist

Before prompting Agent, ask yourself:

- [ ] Is my request specific and clear?
- [ ] Have I provided necessary context?
- [ ] Am I asking for one thing at a time?
- [ ] Have I mentioned relevant files with @filename?
- [ ] Did I include error messages (if debugging)?
- [ ] Have I shown an example of what I want?
- [ ] Is my language positive and direct?
- [ ] Have I defined success criteria?

---

## 🎯 Quick Reference

### **For Building Features:**
```
"Create [feature] with [requirements]
- Requirement 1
- Requirement 2
- Requirement 3

Update these files:
- @path/to/file1
- @path/to/file2

Test by [how to verify it works]"
```

### **For Debugging:**
```
"[What's broken] isn't working

Error: [exact error message]

What I've checked:
- Thing 1
- Thing 2

Please investigate [specific area]"
```

### **For Documentation:**
```
"Create documentation for [topic]

Include:
- Section 1
- Section 2
- Section 3

Format: [specify format]
Detail level: [similar to existing doc]"
```

### **For Refactoring:**
```
"Refactor @path/to/file to:
- Improvement 1
- Improvement 2

Keep the same functionality
Don't break existing tests"
```

---

## 🔄 Iterative Development Workflow

### **Phase 1: Plan**
```
"I want to add email notifications for new bookings.
What approach do you recommend?"
```

### **Phase 2: Implement**
```
"Let's use Resend API. First, add the email template:
[paste template or describe requirements]"
```

### **Phase 3: Test**
```
"Create a test script to verify email sending works"
```

### **Phase 4: Debug**
```
"Getting error [paste error]. Help me fix it."
```

### **Phase 5: Document**
```
"Document the email notification system in EMAIL_AUTOMATION_SETUP.md"
```

### **Phase 6: Backup**
```
"Create a backup with all recent changes"
```

---

## 📚 Resources

### **In Your Project:**
- `replit.md` - Project overview and preferences
- `EMAIL_SERVER_SETUP_GUIDE.md` - Email server setup
- `LANGUAGE_SUPPORT.md` - Internationalization guide
- `FINAL_CONFIGURATION_SUMMARY.md` - System configuration

### **Replit Features:**
- **Checkpoints:** Automatic savepoints for rollback
- **Web Search:** Agent can search for current information
- **File Mentions:** Use @filename for context
- **Extended Thinking:** Toggle for deeper AI reasoning
- **High Power Mode:** Advanced AI for complex tasks

---

## 🎓 Learning by Example

### **Your Recent Successful Prompts:**

1. **Secrets Backup:**
   ```
   "export secrets"
   ```
   → Simple, clear, used established command

2. **Documentation Request:**
   ```
   "Can you also document how to prompt the agent 
   as you've described earlier?"
   ```
   → Specific request, referenced previous context

3. **Confirmation:**
   ```
   "Confirmed"
   ```
   → Clear, direct response to action request

---

## 💪 Advanced: Working with Complex Projects

### **For Multi-File Changes:**
```
"Update the booking flow to include payment:

1. Schema: Add payment_status to bookings table (@shared/schema.ts)
2. Backend: Add payment validation endpoint (@server/routes.ts)
3. Frontend: Add payment form step (@client/src/pages/BookingPage.tsx)
4. Email: Include payment info in confirmations (@email_templates/)

Test with: Create booking → Submit payment → Verify database → Check email"
```

### **For System-Wide Updates:**
```
"Upgrade the i18n system to support 2 more languages (German, Italian):

1. Add de.json and it.json translations
2. Update language selector component
3. Add flags for Germany and Italy
4. Test language switching
5. Update LANGUAGE_SUPPORT.md

Use existing Spanish translations as template"
```

---

## 🎉 Summary

**Remember:**
- ✅ Be specific and clear
- ✅ Provide context and examples
- ✅ Break complex tasks into steps
- ✅ Use positive, direct language
- ✅ Iterate and refine
- ✅ Test each change
- ✅ Document important decisions

**Agent is your development partner.** The clearer you communicate, the better results you'll get!

---

**Happy Coding!** 🚀
