# Archived Features

This folder contains features that have been removed from the main application but archived for potential future use.

## Phone Verification (OTP)

**Archived on:** November 11, 2025  
**Reason:** Simplified testing UI to focus on core features

### Files:
- `phone-verification-section.html` - HTML/JS code for OTP verification
- `verify-test.html` - Standalone phone verification testing page

### Description:
Phone verification using Twilio Verify service for OTP (One-Time Password) authentication. This feature allowed users to verify their phone numbers by receiving a 6-digit code via SMS.

### To Re-enable:
1. Copy the HTML section from `phone-verification-section.html` back into `testing-ui/index.html`
2. Copy the JavaScript logic from the same file
3. Ensure SMS service is running on port 4004 with Twilio Verify configured
4. Set `TWILIO_VERIFY_SERVICE_SID` in environment variables

### Dependencies:
- Twilio Verify service (separate from regular SMS)
- SMS service endpoint: `http://localhost:4004/verify/send` and `/verify/check`
- Phone numbers must be in E.164 format (e.g., +61412345678)

### Testing:
Use `verify-test.html` for standalone testing of the OTP flow without the full testing UI.
