import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    index: true 
  },
  jid: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'verified', 'expired'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600 // Auto delete after 10 minutes
  }
});

const Otp = mongoose.model('Otp', OtpSchema);
export default Otp;
