<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Support Message</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #1e293b;
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .content {
            padding: 32px 24px;
        }
        .field {
            margin-bottom: 20px;
        }
        .label {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 4px;
        }
        .value {
            font-size: 14px;
            font-weight: 500;
            color: #0f172a;
        }
        .message-box {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 16px;
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            white-space: pre-wrap;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 16px 24px;
            font-size: 11px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Support Submission</h1>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Sender Name</div>
                <div class="value">{{ $data['name'] }}</div>
            </div>
            <div class="field">
                <div class="label">Email Address</div>
                <div class="value">
                    <a href="mailto:{{ $data['email'] }}" style="color: #2563eb; text-decoration: none; font-weight: 600;">
                        {{ $data['email'] }}
                    </a>
                </div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="message-box">{{ $data['message'] }}</div>
            </div>
        </div>
        <div class="footer">
            This message was sent from the Contact Support form on CSE Reviewer.
        </div>
    </div>
</body>
</html>
