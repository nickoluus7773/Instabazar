
@echo off
cd /d "C:\Users\nishc\OneDrive\Desktop\Instabazar-Team\backend"

"C:\Users\nishc\AppData\Local\Programs\Python\Python314\python.exe" manage.py expire_subscriptions

exit /b %ERRORLEVEL%
