import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { devDocs } from '@/routes';

export default function DevDocs() {
    return (
        <>
            <Head title="Developer Docs" />
            <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-5 leading-relaxed">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                    <header className="bg-white p-10 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] text-center border-t-[6px] border-blue-600">
                        <h1 className="m-0 mb-4 text-gray-900 text-4xl font-bold">
                            Civil Service Exam Reviewer Blueprint
                        </h1>
                        <div className="flex justify-center gap-3 flex-wrap">
                            <span className="bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-sm font-semibold">
                                Timeline: May 23 - Jun 26, 2026
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-sm font-semibold">
                                Stack: Laravel 13 + Inertia v3 + React 19 + Neon
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-sm font-semibold">
                                Budget: $0
                            </span>
                        </div>
                    </header>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            1. Current State Assessment
                        </h2>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">
                                            Layer / Module
                                        </th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">
                                            Implementation Status
                                        </th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">
                                            Technical Details / Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Auth System</td>
                                        <td className="p-3.5 border-b border-gray-200 text-emerald-500 font-bold">
                                            COMPLETE
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Login, Register, 2FA, Passkeys, Email Verification
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Settings Engine</td>
                                        <td className="p-3.5 border-b border-gray-200 text-emerald-500 font-bold">
                                            COMPLETE
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Profile management, Security configurations, Appearance toggle
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">UI Shell</td>
                                        <td className="p-3.5 border-b border-gray-200 text-emerald-500 font-bold">
                                            INSTALLED
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Sidebar + Header layouts, Shadcn UI (26 core primitives installed)
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Database Driver</td>
                                        <td className="p-3.5 border-b border-gray-200 text-emerald-500 font-bold">
                                            CONFIGURED
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            PostgreSQL (Neon serverless) driver and connection variables configured
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Exam Controller</td>
                                        <td className="p-3.5 border-b border-gray-200 text-amber-500 font-bold">
                                            STUB ONLY
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Routes exist but rely on hardcoded data; no active database read/write
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Schema & Question Bank</td>
                                        <td className="p-3.5 border-b border-gray-200 text-red-500 font-bold">
                                            NOT STARTED
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Eloquent Models, migrations, and database seeders are missing
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Admin Panel</td>
                                        <td className="p-3.5 border-b border-gray-200 text-red-500 font-bold">
                                            NOT STARTED
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Management views and administrative authorization guard missing
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Gemini AI Integration</td>
                                        <td className="p-3.5 border-b border-gray-200 text-red-500 font-bold">
                                            NOT STARTED
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Service layer for question generation and prompt architecture missing
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Core Exam Engine & Analytics</td>
                                        <td className="p-3.5 border-b border-gray-200 text-red-500 font-bold">
                                            NOT STARTED
                                        </td>
                                        <td className="p-3.5 border-b border-gray-200">
                                            Run-time state engine, scoring calculations, and telemetry analytics missing
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            2. Architectural Design Decisions
                        </h2>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li>
                                <strong>Exam Timer Constraints:</strong> Professional: 3h 10m (11,400s) |
                                Subprofessional: 2h 40m (9,600s) | Drills: untimed.
                            </li>
                            <li>
                                <strong>Demographic (EDQ) Questions:</strong> Mirror real CSE survey. Always same 20
                                questions, seeded once.
                            </li>
                            <li>
                                <strong>Difficulty Weighting:</strong> Random selection from published questions
                                regardless of difficulty.
                            </li>
                            <li>
                                <strong>Admin Identification:</strong> Managed via <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">role</code> column (enum: user, admin)
                                on users table.
                            </li>
                            <li>
                                <strong>Exam Retake Policy:</strong> User chooses: retake same exam OR generate fresh
                                set.
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            3. Database Schema & JSONB Structures
                        </h2>
                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Key Architectural Constraint</h3>
                        <p>
                            To stay strictly within the free-tier connection limits of Neon PostgreSQL and prevent query overhead,{' '}
                            <strong>
                                all user exam answers and item states are stored as a single JSONB record within a single{' '}
                                <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">exam_attempts</code> table row
                            </strong>
                            . No separate junction or response tables are created.
                        </p>

                        <pre className="bg-slate-800 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed my-4">
                            <code className="font-mono">
                                {`+------------------+          +-------------------+          +-------------------+
|    categories    |          |   subcategories   |          |     questions     |
+------------------+          +-------------------+          +-------------------+
| id (PK)          |<--------+| category_id (FK)  |<--------+| subcategory_id(FK)|
| name             |          | name              |          | language          |
| slug (UQ)        |          | slug              |          | stem              |
| is_demographic   |          | language          |          | options (JSONB)   |
| sort_order       |          | sort_order        |          | correct_option    |
+------------------+          +-------------------+          | explanation       |
         |                             ^                     | created_by (FK)---|----+
         |                             |                     +-------------------+    |
         v                             |                                              |
+------------------+                   |                     +-------------------+    |
|  track_configs   |                   |                     |   exam_attempts   |    |
+------------------+                   |                     +-------------------+    |
| id (PK)          |                   +---------------------+ category_id (FK)  |    |
| track (Enum)     |                                         | user_id (FK)------+    |
| category_id (FK) |                                         | question_ids(JSONB|    |
| item_count       |                                         | answers (JSONB)   |    |
| time_limit_secs  |                                         | cat_scores (JSONB)|    |
+------------------+                                         +-------------------+    |
                                                                       |              |
                                                                       v              v
                                                             +----------------------- +   
                                                             |         users          |
                                                             +------------------------+   
                                                             | id (PK)                |
                                                             | name                   |
                                                             | email (UQ)             |
                                                             | email_verified_at      |
                                                             | password (nullable)    |
                                                             | provider (nullable)    |
                                                             | provider_id (nullable) |
                                                             | role (Enum)            |
                                                             | remember_token         |
                                                             +------------------------+`}
                            </code>
                        </pre>

                        <h3 className="text-gray-700 mt-8 mb-4 text-xl font-bold">Database Schema Reference</h3>

                        {/* 1. users */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Table:</span>
                            <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">users</code>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Column</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[8%]">Key</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[12%]">Type</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Description</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Sample Value</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">PK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Auto-incrementing unique identifier.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Unique database key to identify and establish relationships for examinees.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">name</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">The full name of the user.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"Jane Doe"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Displayed in greetings, headers, profile views, and results certificates.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">email</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">UQ</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Unique email address of the user.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"jane.doe@example.com"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Primary login credential and target for security and verification emails.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">email_verified_at</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Timestamp (Nullable)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Timestamp when email verification completed.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"2026-05-24 03:00:00"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Validates if the user is authorized to bypass email verification guards.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">password</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String (Nullable)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Hashed password credential. Nullable to support social login accounts.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em] font-mono">"$2y$12$e..."</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Secures local accounts against credential compromise.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">provider</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String (Nullable)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Social login provider identification.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"google"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Allows authentication routing and callbacks from third-party OAuth flows.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">provider_id</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String (Nullable)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Unique user identification from social provider.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"1092839284"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Uniquely associates the third-party account credential with the local database user record.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">role</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Enum ("admin" | "user")</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Authorization access group.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"user"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Restricts administrative control panels to administrators.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">remember_token</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String (Nullable)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Token for persisting the login session.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"f4Ea2s1..."</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Keeps user logged in securely across browser sessions.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 2. categories */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Table:</span>
                            <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">categories</code>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Column</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[8%]">Key</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[12%]">Type</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Description</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Sample Value</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">PK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Auto-incrementing unique identifier.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Unique identifier for database indexing, relationships, and queries.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">name</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Human-readable name of the category.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"Verbal Ability"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Displayed to examinees on the sidebar, dashboards, and score reports.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">slug</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">UQ</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Unique URL-friendly slug used for identification.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"verbal-ability"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Used as route parameter binds (e.g. `/drills/verbal-ability`) and dictionary keys in telemetry.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">is_demographic</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Boolean</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Indicates if the category belongs to the demographic survey (EDQ).</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">false</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Identifies survey-only sections that must be completed first and excluded from grading.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">sort_order</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Integer</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Determines display sorting order.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Enforces standard vertical ordering on dashboards and performance breakdowns.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3. subcategories */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Table:</span>
                            <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">subcategories</code>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Column</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[8%]">Key</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[12%]">Type</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Description</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Sample Value</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">category_id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">FK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">References <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[0.85em]">categories.id</code>.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Establishes relationship linking the subcategory to its parent exam category.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">name</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Name of the subcategory.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"Word Meaning"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Provides fine-grained labels for analytical graphs and detailed review sheets.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">slug</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">URL-friendly slug.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"word-meaning"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Internal code-level configuration and dynamic query parameters.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">language</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Language of instruction.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"English"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Allows segregation of questions based on language settings.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">sort_order</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Integer</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Determines display sorting order.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Ensures subcategories are ordered predictably when presented in drop-downs or reports.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. questions */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Table:</span>
                            <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">questions</code>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Column</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[8%]">Key</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[12%]">Type</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Description</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Sample Value</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">subcategory_id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">FK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">References <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[0.85em]">subcategories.id</code>.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">2</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Categorizes the question for structured exam blueprints and telemetry analysis.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">language</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Language of the question.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"English"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Ensures questions are selected matching the language request of the examinee.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">stem</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Text</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">The core question text or prompt.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"What is the synonym of 'benevolent'?"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">The primary question text rendered in the viewport to the examinee.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">options</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">JSONB (Array)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Ordered choices array.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">["Kind", "Cruel", "Lazy", "Smart"]</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Provides dynamic, indexable list of interactive choices for the interface.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">correct_option</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Integer</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">0-based index of correct option.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">0</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Used as reference to programmatically grade user submissions.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">explanation</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Text</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Explanation for the correct option.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"'Benevolent' means kind and generous."</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Provides formative feedback to users on the results and review views.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">created_by</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">FK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">References <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[0.85em]">users.id</code>.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Audits which administrator created the question for history and gaps.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 5. track_configs */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Table:</span>
                            <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">track_configs</code>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Column</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[8%]">Key</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[12%]">Type</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Description</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Sample Value</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">PK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Auto-incrementing unique identifier.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Unique database ID for indexing and editing track settings.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">track</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">Enum</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">String ("Professional" | "Subprofessional")</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">CSE track assigned to this configuration.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">"Professional"</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Binds configuration entries to specific mock exam types.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">category_id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">FK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">References <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[0.85em]">categories.id</code>.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Links the blueprint rule to a specific parent category.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">item_count</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Integer</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Target number of questions.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">45</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Defines how many questions the assembler must pull for this category.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">time_limit_secs</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">Integer</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Time limit in seconds.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">11400</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Sets the countdown timer value for active attempts in this track.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 6. exam_attempts */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Table:</span>
                            <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">exam_attempts</code>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Column</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[8%]">Key</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[12%]">Type</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Description</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[15%]">Sample Value</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">category_id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">FK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger (Nullable)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">References parent category if a drill; null for full mock exams.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">null</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Determines if the attempt is single-category practice (drill) or standard full simulation.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">user_id</code></td>
                                        <td className="p-3 border-b border-gray-200 font-semibold text-slate-500">FK</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">BigInteger</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">References user who took this exam.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">1</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Asserts session ownership of the attempt for progress tracking.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">question_ids</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">JSONB (Array)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Ordered array of question IDs in this attempt.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">[101, 102, 103]</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Records the exact randomized sequence of questions to serve consistently on resume/review.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">answers</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">JSONB (Object)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Sparse answers map, mapping question ID string to option index.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">{"{\"101\": 2, \"103\": 0}"}</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Stores selected answers in-situ without needing response-level database writes.</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200 font-medium"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">cat_scores</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 font-normal">N/A</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[0.85em]">JSONB (Object)</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Detailed category and subcategory scoring breakdown.</td>
                                        <td className="p-3 border-b border-gray-200"><code className="font-mono bg-slate-100 text-emerald-600 px-1 py-0.5 rounded text-[0.85em]">{"{\"verbal_ability\": {\"total\": 45, \"correct\": 38}}"}</code></td>
                                        <td className="p-3 border-b border-gray-200 text-gray-600">Saves pre-calculated grades for instant rendering of the progress analytics accordion.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">JSONB Column Structures</h3>

                        <p>
                            <strong>questions.options</strong> (Simple ordered array):
                        </p>
                        <pre className="bg-slate-800 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed my-4">
                            <code className="font-mono">
                                {`["Manila", "Cebu", "Davao", "Quezon City"]`}
                            </code>
                        </pre>

                        <p>
                            <strong>exam_attempts.question_ids</strong> (Ordered array preserving exam sequence):
                        </p>
                        <pre className="bg-slate-800 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed my-4">
                            <code className="font-mono">
                                {`[101, 102, 103, 204, 205, 306, 307]`}
                            </code>
                        </pre>

                        <p>
                            <strong>exam_attempts.answers</strong> (Sparse map, unanswered items absent):
                        </p>
                        <pre className="bg-slate-800 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed my-4">
                            <code className="font-mono">
                                {`{"101": 2, "102": 0, "103": 3, "205": 1}`}
                            </code>
                        </pre>

                        <p>
                            <strong>exam_attempts.category_scores</strong> (Nested breakdown for the results accordion):
                        </p>
                        <pre className="bg-slate-800 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed my-4">
                            <code className="font-mono">
                                {`{
  "verbal_ability": {
    "total": 45,
    "correct": 38,
    "percentage": 84.44,
    "subcategories": {
      "word_meaning": {"total": 8, "correct": 7},
      "sentence_completion": {"total": 8, "correct": 6},
      "error_recognition": {"total": 7, "correct": 7},
      "sentence_structure": {"total": 7, "correct": 6},
      "paragraph_organization": {"total": 8, "correct": 6},
      "reading_comprehension": {"total": 7, "correct": 6}
    }
  },
  "analytical_ability": {
    "total": 52,
    "correct": 40,
    "percentage": 76.92,
    "subcategories": {}
  },
  "demographic_profile": null
}`}
                            </code>
                        </pre>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            4. Configurations & Relationships
                        </h2>
                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Subcategory & Distribution Seed Matrices</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Category</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Target Subcategories</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Languages</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Pro Items</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">SubPro Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Demographic Profile</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">20 Fixed EDQ Survey Questions</td>
                                        <td className="p-3.5 border-b border-gray-200">English</td>
                                        <td className="p-3.5 border-b border-gray-200">20</td>
                                        <td className="p-3.5 border-b border-gray-200">20</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Verbal Ability</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">Word Meaning, Sentence Completion, Error Recognition, Sentence Structure, Paragraph Organization, Reading Comprehension</td>
                                        <td className="p-3.5 border-b border-gray-200">English, Filipino</td>
                                        <td className="p-3.5 border-b border-gray-200">45</td>
                                        <td className="p-3.5 border-b border-gray-200">45</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Analytical Ability</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">Word Association, Data Interpretation, Logical Reasoning</td>
                                        <td className="p-3.5 border-b border-gray-200">English, Filipino</td>
                                        <td className="p-3.5 border-b border-gray-200">52</td>
                                        <td className="p-3.5 border-b border-gray-200">0</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Clerical Ability</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">Filing, Spelling</td>
                                        <td className="p-3.5 border-b border-gray-200">English</td>
                                        <td className="p-3.5 border-b border-gray-200">0</td>
                                        <td className="p-3.5 border-b border-gray-200">47</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Numerical Ability</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">Basic Operations, Number Sequence, Word Problems</td>
                                        <td className="p-3.5 border-b border-gray-200">English</td>
                                        <td className="p-3.5 border-b border-gray-200">45</td>
                                        <td className="p-3.5 border-b border-gray-200">45</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>General Information</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">Philippine Constitution, R.A. 6713, Peace &amp; Human Rights, Environment Management</td>
                                        <td className="p-3.5 border-b border-gray-200">English</td>
                                        <td className="p-3.5 border-b border-gray-200">8</td>
                                        <td className="p-3.5 border-b border-gray-200">8</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>TOTALS</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"></td>
                                        <td className="p-3.5 border-b border-gray-200"></td>
                                        <td className="p-3.5 border-b border-gray-200"><strong>170 (150 Scored)</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><strong>165 (145 Scored)</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Timer Configuration (stored in <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">track_configs</code>)</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Track</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Total Items</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Scored Items</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Time Limit</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Per-Item Pace</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Professional</td>
                                        <td className="p-3.5 border-b border-gray-200">170</td>
                                        <td className="p-3.5 border-b border-gray-200">150</td>
                                        <td className="p-3.5 border-b border-gray-200">3 hours 10 minutes (11,400s)</td>
                                        <td className="p-3.5 border-b border-gray-200">~67s/item</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Subprofessional</td>
                                        <td className="p-3.5 border-b border-gray-200">165</td>
                                        <td className="p-3.5 border-b border-gray-200">145</td>
                                        <td className="p-3.5 border-b border-gray-200">2 hours 40 minutes (9,600s)</td>
                                        <td className="p-3.5 border-b border-gray-200">~58s/item</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Category Drill</td>
                                        <td className="p-3.5 border-b border-gray-200">Variable</td>
                                        <td className="p-3.5 border-b border-gray-200">All</td>
                                        <td className="p-3.5 border-b border-gray-200">Untimed</td>
                                        <td className="p-3.5 border-b border-gray-200">N/A</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            5. Backend Architecture
                        </h2>
                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Models & Relationships</h3>

                        {/* 1. User Model */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Model:</span>
                            <strong className="text-blue-600">User</strong>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Key Relationships</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Fillable</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Hidden</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Casts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">hasMany(ExamAttempt)</code>
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">hasMany(Question, 'created_by')</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">name</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">email</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">password</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">role</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">provider</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">provider_id</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">password</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">two_factor_secret</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">two_factor_recovery_codes</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">remember_token</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">email_verified_at</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">datetime</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">password</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">hashed</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">two_factor_confirmed_at</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">datetime</code></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 2. Category Model */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Model:</span>
                            <strong className="text-blue-600">Category</strong>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Key Relationships</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Fillable</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Hidden</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Casts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">hasMany(Subcategory)</code>
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">hasMany(TrackConfig)</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">name</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">slug</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">is_demographic</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">sort_order</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 italic">None</td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">is_demographic</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">boolean</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">sort_order</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3. Subcategory Model */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Model:</span>
                            <strong className="text-blue-600">Subcategory</strong>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Key Relationships</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Fillable</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Hidden</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Casts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">belongsTo(Category)</code>
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">hasMany(Question)</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">category_id</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">name</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">slug</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">language</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">sort_order</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 italic">None</td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">category_id</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">sort_order</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. TrackConfig Model */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Model:</span>
                            <strong className="text-blue-600">TrackConfig</strong>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Key Relationships</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Fillable</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Hidden</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Casts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">belongsTo(Category)</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">track</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">category_id</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">item_count</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">time_limit_secs</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 italic">None</td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">category_id</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">item_count</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">time_limit_secs</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 5. Question Model */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Model:</span>
                            <strong className="text-blue-600">Question</strong>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Key Relationships</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Fillable</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Hidden</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Casts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">belongsTo(Subcategory)</code>
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">belongsTo(User, 'created_by')</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">subcategory_id</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">language</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">stem</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">options</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">correct_option</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">explanation</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">created_by</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 italic">None</td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">subcategory_id</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">options</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">array</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">correct_option</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">created_by</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 6. ExamAttempt Model */}
                        <h4 className="text-gray-700 mt-6 mb-2 text-lg font-bold flex items-center gap-2">
                            <span>Model:</span>
                            <strong className="text-blue-600">ExamAttempt</strong>
                        </h4>
                        <div className="my-4 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Key Relationships</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Fillable</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Hidden</th>
                                        <th className="p-3 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider w-[25%]">Casts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">belongsTo(User)</code>
                                                <code className="font-mono bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded text-[0.85em] w-fit">belongsTo(Category)</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">category_id</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">user_id</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">question_ids</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">answers</code>
                                                <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[0.85em]">cat_scores</code>
                                            </div>
                                        </td>
                                        <td className="p-3 border-b border-gray-200 text-gray-400 italic">None</td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">category_id</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">user_id</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">integer</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">question_ids</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">array</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">answers</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">array</code></div>
                                                <div className="text-xs text-gray-600"><code className="font-mono text-slate-700 bg-slate-100 px-1 rounded text-[0.9em]">cat_scores</code> &rarr; <code className="font-mono text-emerald-600 bg-slate-100 px-1 rounded text-[0.9em]">array</code></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">User Role System</h3>
                        <p>The <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">users.role</code> column uses a string enum (<code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">user</code> | <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">admin</code>). The <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">User</code> model exposes:</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">isAdmin(): bool</code> checks <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">$this-&gt;role === 'admin'</code></li>
                            <li>Role is shared to the frontend via <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">HandleInertiaRequests</code> middleware in <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">auth.user</code></li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Controllers</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Controller</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Methods</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>DashboardController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">index</code></td>
                                        <td className="p-3.5 border-b border-gray-200">User analytics: avg score, total exams, category strengths</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>ExamController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">setup</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">assemble</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">submit</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">results</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">review</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">retake</code></td>
                                        <td className="p-3.5 border-b border-gray-200">Full exam lifecycle + retake (same or fresh)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>DrillController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">index</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">assemble</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">submit</code></td>
                                        <td className="p-3.5 border-b border-gray-200">Category drill: pick category, fetch questions, save results</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>HistoryController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">index</code></td>
                                        <td className="p-3.5 border-b border-gray-200">Past attempts list with pagination</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Admin\DashboardController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">index</code></td>
                                        <td className="p-3.5 border-b border-gray-200">Admin metrics: user count, question count, coverage gaps</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Admin\QuestionController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">index</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">create</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">store</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">edit</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">update</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">destroy</code></td>
                                        <td className="p-3.5 border-b border-gray-200">Full question CRUD</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>Admin\GeneratorController</strong></td>
                                        <td className="p-3.5 border-b border-gray-200"><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">index</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">generate</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">commit</code></td>
                                        <td className="p-3.5 border-b border-gray-200">AI batch generation UI, Gemini call, bulk insert</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Middleware</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Middleware</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200"><strong>EnsureRole</strong></td>
                                        <td className="p-3.5 border-b border-gray-200">Gates routes behind <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">$user-&gt;role</code> check. Usage: <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">-&gt;middleware('role:admin')</code></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Services</h3>
                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">1. ExamAssemblerService</h3>
                        <p>Constructs a balanced question set for a full mock exam or category drill.</p>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-5 text-gray-800">
                            <strong>Minimum Question Threshold:</strong> Before assembly, validate the bank has enough published questions per category. Return error: "Verbal Ability needs 45 questions but only has 32 published."
                        </div>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Full Exam Assembly Algorithm:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Accept <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">track</code> parameter and optional <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">exclude_attempt_id</code> (for fresh retake exclusion).</li>
                                    <li>Load all <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">track_configs</code> for that track, ordered by <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">sort_order</code>.</li>
                                    <li>For demographic category: always return the same fixed 20 EDQ question IDs (seeded once, never changes).</li>
                                    <li>For each scored category in config:
                                        <ul className="list-disc pl-6 mt-2 space-y-2">
                                            <li>Load all subcategories under that category.</li>
                                            <li>Count available published questions per subcategory.</li>
                                            <li>Proportionally distribute <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">item_count</code> across subcategories using floor division + random remainder allocation.</li>
                                            <li>Randomly select published questions per subcategory (no difficulty weighting).</li>
                                        </ul>
                                    </li>
                                    <li>Optionally exclude question IDs from a specific previous attempt (for fresh retake).</li>
                                    <li>Concatenate: demographics first, then scored sections in track config order.</li>
                                    <li>Return ordered array of question IDs + eager-loaded question data.</li>
                                </ul>
                            </li>
                            <li><strong>Retake Logic:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>"Retake Same Exam": Load <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">question_ids</code> from the original ExamAttempt, re-serve the same set.</li>
                                    <li>"Take Fresh Exam": Call assembler with <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">exclude_attempt_id</code> to avoid overlap where possible.</li>
                                </ul>
                            </li>
                            <li><strong>Category Drill Assembly:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Accept <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">category_id</code> (or <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">subcategory_id</code>) and count.</li>
                                    <li>Pull count random published questions from that scope.</li>
                                    <li>No demographics, no timer enforcement.</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">2. ScoreCalculatorService</h3>
                        <p>Processes a submitted exam and computes all scoring data.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Algorithm:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Accept: <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">track</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">question_ids[]</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">answers&#123;&#125;</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">time_spent_seconds</code>.</li>
                                    <li>Load all questions by IDs with subcategory to category relationships.</li>
                                    <li>Partition questions into demographic (skip) vs. scored.</li>
                                    <li>For each scored question: compare <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">answers[question_id]</code> against <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">question.correct_option</code>.</li>
                                    <li>Aggregate by category and subcategory into the <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">category_scores</code> JSONB structure.</li>
                                    <li>Compute: <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">scored_items</code> (150 for Pro, 145 for SubPro), <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">correct_count</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">score_percentage</code>.</li>
                                    <li>Apply pass threshold: passed = <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">score_percentage &gt;= 80.00</code>.</li>
                                    <li>Insert single ExamAttempt row with all computed data.</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">3. GeminiService</h3>
                        <p>Wraps the Google Gemini API for question generation.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Design:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Uses Laravel <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">Http::withToken()</code> to call <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">generativelanguage.googleapis.com</code>.</li>
                                    <li>Model: <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">gemini-2.0-flash</code> (free tier).</li>
                                    <li>Structured prompt requesting JSON array output with: <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">stem</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">options[]</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">correct_option</code>, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">explanation</code>.</li>
                                    <li>Validates response (exactly 4 options, <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">correct_option</code> 0-3, non-empty fields).</li>
                                    <li>Returns validated question array to controller for admin preview.</li>
                                </ul>
                            </li>
                            <li><strong>Rate Limit Strategy (15 RPM / 1,500 RPD):</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Daily call count tracked in cache table (key: <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">gemini_calls_&#123;date&#125;</code>, TTL: 24h).</li>
                                    <li>Before each call: check count &lt; 1,500; abort with warning if exceeded.</li>
                                    <li>Frontend enforces 4-second delay between requests (stays under 15 RPM).</li>
                                    <li>Each API call generates multiple questions in one prompt (5-10 per call) to maximize yield.</li>
                                </ul>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            5. Frontend Architecture
                        </h2>
                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Page Routing & Layout Map</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Route</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Page Component</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Layout</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Auth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/welcome.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">None (standalone)</td>
                                        <td className="p-3.5 border-b border-gray-200">Public</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/login</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/auth/login.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AuthLayout</td>
                                        <td className="p-3.5 border-b border-gray-200">Public</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/register</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/auth/register.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AuthLayout</td>
                                        <td className="p-3.5 border-b border-gray-200">Public</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/dashboard</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/dashboard.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/exams/setup</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/exams/setup.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/exams/session</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/exams/session.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200"><strong>ExamLayout</strong> (fullscreen)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/exams/&#123;attempt&#125;/results</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/exams/results.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/exams/&#123;attempt&#125;/review</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/exams/review.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/drills</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/drills/index.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/drills/session</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/drills/session.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200"><strong>ExamLayout</strong> (fullscreen)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/history</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/history/index.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/settings/*</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/settings/*.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout + SettingsLayout</td>
                                        <td className="p-3.5 border-b border-gray-200">User</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/admin/dashboard</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/admin/dashboard.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">Admin</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/admin/questions</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/admin/questions/index.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">Admin</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/admin/questions/create</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/admin/questions/create.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">Admin</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/admin/questions/&#123;id&#125;/edit</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/admin/questions/edit.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">Admin</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">/admin/generator</td>
                                        <td className="p-3.5 border-b border-gray-200">pages/admin/generator/index.tsx</td>
                                        <td className="p-3.5 border-b border-gray-200">AppLayout (sidebar)</td>
                                        <td className="p-3.5 border-b border-gray-200">Admin</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-5 text-gray-800">
                            <strong>NOTE:</strong> <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">ExamLayout</code> is a new minimal fullscreen layout (no sidebar, no header nav) for active exam/drill sessions. Includes only a thin top bar with the timer and an "Exit Exam" confirmation button.
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Sidebar Navigation Structure</h3>
                        <h4 className="font-bold text-gray-800">User Section (always visible when authenticated):</h4>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Label</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Icon</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Route</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Dashboard</td>
                                        <td className="p-3.5 border-b border-gray-200">LayoutGrid</td>
                                        <td className="p-3.5 border-b border-gray-200">/dashboard</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Take Mock Exam</td>
                                        <td className="p-3.5 border-b border-gray-200">ClipboardList</td>
                                        <td className="p-3.5 border-b border-gray-200">/exams/setup</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Category Drills</td>
                                        <td className="p-3.5 border-b border-gray-200">Target</td>
                                        <td className="p-3.5 border-b border-gray-200">/drills</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">History & Review</td>
                                        <td className="p-3.5 border-b border-gray-200">History</td>
                                        <td className="p-3.5 border-b border-gray-200">/history</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h4 className="font-bold text-gray-800">Admin Section (visible only when auth.user.role === 'admin'):</h4>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Label</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Icon</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Route</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Admin Dashboard</td>
                                        <td className="p-3.5 border-b border-gray-200">ShieldCheck</td>
                                        <td className="p-3.5 border-b border-gray-200">/admin/dashboard</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">AI Generator</td>
                                        <td className="p-3.5 border-b border-gray-200">Sparkles</td>
                                        <td className="p-3.5 border-b border-gray-200">/admin/generator</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Question Bank</td>
                                        <td className="p-3.5 border-b border-gray-200">Database</td>
                                        <td className="p-3.5 border-b border-gray-200">/admin/questions</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            6. Client-Side Exam State Machine
                        </h2>

                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-5 text-gray-800">
                            <strong>IMPORTANT:</strong> The entire active exam session runs in React state with zero server round-trips until final submission. This is the core strategy for staying within Neon's free connection limits.
                        </div>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">State Shape (managed via useReducer)</h3>
                        <pre className="bg-slate-800 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed my-4">
                            <code className="font-mono">
                                {`ExamState {
  track: 'professional' | 'subprofessional'
  mode: 'full_exam' | 'category_drill'
  questions: Question[]
  totalItems: number             // 170 or 165 or custom drill count
  currentIndex: number           // 0-based
  answers: Map<questionId, selectedOption>
  flagged: Set<questionId>
  timeRemaining: number          // seconds (11400 or 9600 or null for drills)
  timeLimitSeconds: number       // original limit for time_spent calc
  startedAt: Date
  status: 'loading' | 'active' | 'submitting' | 'submitted'
  attemptId: number | null       // set after retake-same-exam load
}`}
                            </code>
                        </pre>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Reducer Actions</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Action</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Effect</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">SELECT_ANSWER</td>
                                        <td className="p-3.5 border-b border-gray-200">Sets <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">answers[questionId] = optionIndex</code></td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">TOGGLE_FLAG</td>
                                        <td className="p-3.5 border-b border-gray-200">Adds/removes questionId from <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">flagged</code> set</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">NAVIGATE</td>
                                        <td className="p-3.5 border-b border-gray-200">Sets <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">currentIndex</code> to target index</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">NEXT / PREV</td>
                                        <td className="p-3.5 border-b border-gray-200">Increments/decrements <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">currentIndex</code></td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">TICK</td>
                                        <td className="p-3.5 border-b border-gray-200">Decrements <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">timeRemaining</code> by 1</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">SUBMIT</td>
                                        <td className="p-3.5 border-b border-gray-200">Sets status to <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">submitting</code>, triggers POST</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">TIME_UP</td>
                                        <td className="p-3.5 border-b border-gray-200">Auto-triggers SUBMIT when timer hits 0</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>localStorage Backup:</strong> On every <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">SELECT_ANSWER</code> and <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">TOGGLE_FLAG</code>, persist state to localStorage under <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">cse_exam_session</code>. On mount, check for existing session and offer to resume. Clear on successful submission.</li>
                            <li><strong>Retake Flow:</strong> From the results page, the user sees two buttons:
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><strong>"Retake Same Exam"</strong> navigates to <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">/exams/session</code> with <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">?retake=&#123;attemptId&#125;</code>. Backend loads the same question_ids from that attempt.</li>
                                    <li><strong>"Take Fresh Exam"</strong> navigates to <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">/exams/session</code> with <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">?fresh=1&amp;exclude=&#123;attemptId&#125;</code>. Backend assembles new questions, excluding the previous attempt's set where possible.</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Server Awakening Handler</h3>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Problem:</strong> Render free tier sleeps after 15 min inactivity. Cold boot takes 50+ seconds.</li>
                            <li><strong>Solution (Two layers):</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><strong>Blade-level:</strong> CSS-only pulsing animation in <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">app.blade.php</code> inside the <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">#app</code> div. React hydration replaces it automatically.</li>
                                    <li><strong>React-level:</strong> <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">&lt;ServerAwakeningOverlay&gt;</code> component triggered by Inertia global events when navigation exceeds 5 seconds. Shows: "Waking up server resources... Please wait up to 60 seconds." with animated skeleton.</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Free-Tier Constraint Solutions</h3>
                        <div className="my-6 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Constraint</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Limit</th>
                                        <th className="p-3.5 border-b border-gray-200 font-semibold text-slate-700 uppercase text-[0.85em] tracking-wider">Solution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Neon PostgreSQL</td>
                                        <td className="p-3.5 border-b border-gray-200">0.5 GiB storage, connection pooling limits</td>
                                        <td className="p-3.5 border-b border-gray-200">JSONB answers in single row per attempt; no junction table; Neon built-in pgBouncer</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Render Web Service</td>
                                        <td className="p-3.5 border-b border-gray-200">Spins down after 15 min idle; 750 free hours/month</td>
                                        <td className="p-3.5 border-b border-gray-200">Blade + React awakening screens; single web service (no worker)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Render - No Worker</td>
                                        <td className="p-3.5 border-b border-gray-200">Can't run separate queue worker process</td>
                                        <td className="p-3.5 border-b border-gray-200">All Gemini calls synchronous; no Laravel queues; database session/cache drivers</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">Gemini API</td>
                                        <td className="p-3.5 border-b border-gray-200">15 RPM / 1,500 RPD (free tier)</td>
                                        <td className="p-3.5 border-b border-gray-200">Batch 5-10 questions per prompt; client-side throttling; daily counter in cache</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3.5 border-b border-gray-200">$0 Budget</td>
                                        <td className="p-3.5 border-b border-gray-200">No paid services</td>
                                        <td className="p-3.5 border-b border-gray-200">Neon free + Render free + Gemini free + GitHub free for CI</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            7. Phase-by-Phase Implementation Plan
                        </h2>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Phase 1: Database Foundation & Auth Updates (Week 1: May 23 - 29)</h3>
                        <p><strong>Goal:</strong> All migrations, models, seeders, and auth modifications complete.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Migrations (6 new files):</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">add_profile_fields_to_users_table</code>: Add role (string, default 'user'), target_track (string nullable), exam_date (date nullable).</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">create_categories_table</code>: id, name, slug (unique), is_demographic (bool), sort_order, timestamps.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">create_subcategories_table</code>: id, category_id (FK), name, slug, language, sort_order, timestamps.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">create_track_configs_table</code>: id, track, category_id (FK), item_count, time_limit_seconds, sort_order, unique on [track, category_id].</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">create_questions_table</code>: id, subcategory_id (FK), language, stem, options (jsonb), correct_option, explanation, difficulty, status (default draft), created_by (FK nullable), timestamps.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">create_exam_attempts_table</code>: All fields from schema with FKs, JSONB columns, indexes on [user_id, track] and [user_id, created_at].</li>
                                </ul>
                            </li>
                            <li><strong>Models (5 new):</strong> Category, Subcategory, TrackConfig, Question, ExamAttempt with fillable, casts (JSONB to array), relationships.</li>
                            <li><strong>Seeders:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">CategorySeeder</code>: 6 categories with is_demographic flag.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">SubcategorySeeder</code>: All subcategories with language and sort_order.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">TrackConfigSeeder</code>: Both track mappings with exact item counts and timer values.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">DemographicQuestionSeeder</code>: 20 fixed EDQ survey questions mirroring the real CSE.</li>
                                </ul>
                            </li>
                            <li><strong>Auth Updates:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>Modify <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">CreateNewUser</code>: accept target_track field.</li>
                                    <li>Modify <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">register.tsx</code>: add track selector dropdown.</li>
                                    <li>Update <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">HandleInertiaRequests</code>: share role and target_track in auth.user.</li>
                                    <li>Update User model: add role to fillable/casts, add isAdmin() method.</li>
                                </ul>
                            </li>
                            <li><strong>Middleware:</strong> Create <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">EnsureRole</code> middleware, register in bootstrap/app.php. Update <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">app-sidebar.tsx</code> with user nav items + conditional admin section.</li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Phase 2: Admin Panel & AI Question Generator (Week 2: May 30 - Jun 5)</h3>
                        <p><strong>Goal:</strong> Admin can manually CRUD questions and use Gemini AI to batch-generate with rate limiting.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Controllers:</strong> Admin\DashboardController, Admin\QuestionController (resource), Admin\GeneratorController.</li>
                            <li><strong>GeminiService:</strong> Prompt building, response validation, daily rate tracking in cache.</li>
                            <li><strong>Admin Pages:</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">admin/dashboard.tsx</code>: Metric cards + coverage gap table.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">admin/questions/index.tsx</code>: Filterable data table with status badges.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">admin/questions/create.tsx</code>: Manual question form with cascade dropdowns.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">admin/questions/edit.tsx</code>: Edit form pre-populated.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">admin/generator/index.tsx</code>: Parameter dropdowns, generate button, editable preview table, bulk commit.</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Phase 3: Exam Engine & Category Drills (Week 3: Jun 6 - 12)</h3>
                        <p><strong>Goal:</strong> Users can take full mock exams (3h10m Pro / 2h40m SubPro) and untimed category drills.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Backend:</strong> ExamAssemblerService, ScoreCalculatorService, ExamController (setup/assemble/submit), DrillController.</li>
                            <li><strong>Frontend (ExamLayout):</strong> Minimal fullscreen wrapper with timer + exit button. Register in app.tsx.</li>
                            <li><strong>Frontend (Exam Session):</strong>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">useExamReducer</code> hook: Full state machine.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">ExamTimer</code>: Countdown (3:10:00 or 2:40:00), auto-submit at zero.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">QuestionPanel</code>: Stem, 4 radio options, flag toggle.</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">ItemGridNavigator</code>: Numbered grid (gray=unvisited, blue=answered, orange=flagged, light-gray-EDQ=demographic, green-border=current).</li>
                                    <li><code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">SubmitConfirmDialog</code>: X answered, Y unanswered, Z flagged.</li>
                                    <li>localStorage persistence + resume offer.</li>
                                </ul>
                            </li>
                            <li><strong>Frontend (Drills):</strong> Category cards with subcategory question counts, reuses QuestionPanel without timer/demographics.</li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Phase 4: Results, Review & User Dashboard (Week 4: Jun 13 - 19)</h3>
                        <p><strong>Goal:</strong> Post-exam analytics, question-level review, history, and user dashboard.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Results Page:</strong> Pass/Fail banner (80% threshold), category score accordion with subcategory drill-down, demographic section collapsed as "Survey Complete". Retake buttons: "Retake Same Exam" and "Take Fresh Exam".</li>
                            <li><strong>Review Page:</strong> Filter toggles (All/Incorrect/Correct), question cards with green/red styling for answers, explanation callout boxes, sticky question navigator.</li>
                            <li><strong>History Page:</strong> Paginated table of past attempts with scores, filters, "View Results" links.</li>
                            <li><strong>User Dashboard:</strong> Exam date countdown, metric cards (avg score, total exams, total drills), category strength proficiency table with color-coded bars and "Practice" drill links.</li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Phase 5: Landing Page, Polish & Deployment (Week 5: Jun 20 - 26)</h3>
                        <p><strong>Goal:</strong> Conversion-focused landing page, cold boot handler, testing, Render deployment.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Landing Page:</strong> Hero section, feature highlights, live metrics from DB, CTA buttons.</li>
                            <li><strong>Server Awakening:</strong> Blade-level CSS loader + React-level overlay on slow Inertia navigation.</li>
                            <li><strong>Registration Update:</strong> Track selector dropdown + optional exam date picker.</li>
                            <li><strong>Deployment:</strong> Dockerfile (PHP 8.4 + Node + Nginx), env vars on Render, build command, health check at /up, Render managed SSL.</li>
                            <li><strong>Testing:</strong> Pest feature tests for assembly, scoring, admin CRUD, Gemini (mocked). Browser verification of full user flow.</li>
                        </ul>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm">
                        <h2 className="text-blue-600 border-b-2 border-gray-200 pb-3 mt-0 mb-4 text-3xl font-bold">
                            8. Verification Plan
                        </h2>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Automated Tests</h3>
                        <p>Run <code className="font-mono bg-slate-200 text-blue-600 px-1.5 py-0.5 rounded text-[0.9em] font-medium">php artisan test --compact</code> after each phase.</p>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>ExamAssemblerServiceTest:</strong> proportional distribution, threshold errors, demographic inclusion.</li>
                            <li><strong>ScoreCalculatorServiceTest:</strong> 80% threshold, demographic exclusion, JSONB structure.</li>
                            <li><strong>GeminiServiceTest:</strong> mocked HTTP, prompt building, response parsing.</li>
                            <li><strong>AdminQuestionControllerTest:</strong> CRUD, role authorization.</li>
                            <li><strong>ExamControllerTest:</strong> assembly, submission, retake (same + fresh), result retrieval.</li>
                        </ul>

                        <h3 className="text-gray-700 mt-7 mb-3 text-xl font-bold">Manual Verification</h3>
                        <ul className="list-disc pl-6 mb-5 space-y-2">
                            <li><strong>Full user flow:</strong> Register -&gt; Dashboard -&gt; Start Full Exam -&gt; Answer all -&gt; Submit -&gt; Results -&gt; Review -&gt; Retake.</li>
                            <li><strong>Admin flow:</strong> Login -&gt; Generate questions -&gt; Preview -&gt; Commit -&gt; Verify in question bank.</li>
                            <li><strong>Cold boot test:</strong> Let Render sleep -&gt; visit site -&gt; verify awakening screen.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </>
    );
}
