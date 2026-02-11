# Phone Access Setup Guide

## Prerequisites
- Your development machine and phone must be on the same WiFi network
- Backend server must be running

## Steps to Access from Phone

### Step 1: Find Your Machine's IP Address

**On Mac (Terminal):**
```bash
ipconfig getifaddr en0
```

This will output something like: `192.168.1.100` (your actual IP address)

### Step 2: Update Environment Files

#### For Admin Frontend:
Edit `frontend/.env`:
```
VITE_API_URL=http://192.168.1.100:8000
```

#### For User Frontend:
Edit `user-frontend/.env`:
```
VITE_API_URL=http://192.168.1.100:8000
```

Replace `192.168.1.100` with YOUR actual IP address.

### Step 3: Restart Frontends
After updating the .env files, restart both frontend development servers:

**Frontend:**
```bash
cd frontend
npm run dev
```

**User Frontend:**
```bash
cd user-frontend
npm run dev
```

### Step 4: Access from Phone

Open your phone browser and navigate to:
```
http://192.168.1.100:5173     # Admin Frontend (or your assigned port)
http://192.168.1.100:5174     # User Frontend (or your assigned port)
```

## Troubleshooting

### "Failed to fetch" Error
1. **Check IP Address**: Ensure you're using the correct IP from `ipconfig getifaddr en0`
2. **Check Network**: Phone and machine must be on the same WiFi
3. **Check Firewall**: You may need to allow traffic on ports 8000, 5173, 5174
4. **Check Backend**: Ensure backend is running on port 8000
5. **Update .env**: Make sure the .env files have the correct IP address

### Port Already in Use
If you see errors about ports being in use, you can specify custom ports:
```bash
npm run dev -- --port 5175  # For frontend
```

### CORS Errors in Console
The backend now accepts requests from:
- `localhost:3000, 5173, 8000`
- Any IP on local networks (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

### No Logs Appearing
Check the logs directory:
```bash
cat backend/logs/app.log        # View application logs
cat backend/logs/error.log      # View error logs
```

## Network Addresses Explained

- `localhost:8000` - Only works on the same machine
- `192.168.x.x:8000` - Works on the same local network
- Public IP - Would work over the internet (requires additional setup)

## Logger Configuration

The backend now includes comprehensive logging:
- **Info logs**: General information
- **Error logs**: Errors and exceptions
- **HTTP logs**: All API requests with response codes and duration
- **Debug logs**: Development debugging information

Logs are stored in: `backend/logs/`
