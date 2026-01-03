var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, Upload, Send, Mail } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
export default function ContactAgentForm(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, userEmail = _a.userEmail, userName = _a.userName;
    var _b = useState({
        name: userName || '',
        email: userEmail || '',
        subject: '',
        message: ''
    }), formData = _b[0], setFormData = _b[1];
    var _c = useState(null), selectedImage = _c[0], setSelectedImage = _c[1];
    var _d = useState(null), imagePreview = _d[0], setImagePreview = _d[1];
    var _e = useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var toast = useToast().toast;
    var handleImageSelect = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Please select an image smaller than 5MB",
                    variant: "destructive"
                });
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Invalid file type",
                    description: "Please select an image file",
                    variant: "destructive"
                });
                return;
            }
            setSelectedImage(file);
            // Create preview
            var reader_1 = new FileReader();
            reader_1.onloadend = function () {
                setImagePreview(reader_1.result);
            };
            reader_1.readAsDataURL(file);
        }
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var formDataToSend, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    // Validation
                    if (!formData.name.trim()) {
                        toast({
                            title: "Name required",
                            description: "Please enter your name",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    if (!formData.email.trim() || !formData.email.includes('@')) {
                        toast({
                            title: "Valid email required",
                            description: "Please enter a valid email address",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    if (!formData.subject.trim()) {
                        toast({
                            title: "Subject required",
                            description: "Please enter a subject",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    if (!formData.message.trim()) {
                        toast({
                            title: "Message required",
                            description: "Please enter your message",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    formDataToSend = new FormData();
                    formDataToSend.append('name', formData.name);
                    formDataToSend.append('email', formData.email);
                    formDataToSend.append('subject', formData.subject);
                    formDataToSend.append('message', formData.message);
                    if (selectedImage) {
                        formDataToSend.append('image', selectedImage);
                    }
                    return [4 /*yield*/, fetch('/api/contact-agent', {
                            method: 'POST',
                            body: formDataToSend
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        toast({
                            title: "Message sent successfully!",
                            description: "Our team will get back to you within 24 hours.",
                        });
                        // Reset form
                        setFormData({
                            name: userName || '',
                            email: userEmail || '',
                            subject: '',
                            message: ''
                        });
                        setSelectedImage(null);
                        setImagePreview(null);
                        // Close form after 2 seconds
                        setTimeout(function () {
                            onClose();
                        }, 2000);
                    }
                    else {
                        throw new Error('Failed to send message');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error sending message:', error_1);
                    toast({
                        title: "Failed to send message",
                        description: "Please try again or email us directly at support@metachrome.io",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pb-24 md:pb-4">
      <Card className="bg-[#1a1f2e] border-purple-500/30 shadow-2xl w-full max-w-md max-h-[calc(100vh-120px)] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h3 className="text-white font-semibold">Contact Support</h3>
              <p className="text-purple-200 text-xs">We'll respond within 24 hours</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pb-8 md:pb-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} placeholder="Enter your name" className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"/>
          </div>

          {/* Email */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" value={formData.email} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }} placeholder="Enter your email" className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"/>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.subject} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { subject: e.target.value })); }} placeholder="Enter the subject" className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"/>
          </div>

          {/* Message */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea value={formData.message} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { message: e.target.value })); }} placeholder="Type your message..." rows={8} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"/>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">
              Upload image (optional)
            </label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload"/>
              <label htmlFor="image-upload" className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm">
                <Upload className="w-4 h-4"/>
                <span>{selectedImage ? selectedImage.name : 'Upload image (optional)'}</span>
              </label>
            </div>
            {imagePreview && (<div className="mt-2 relative">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg"/>
                <button type="button" onClick={function () {
                setSelectedImage(null);
                setImagePreview(null);
            }} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full">
                  <X className="w-4 h-4"/>
                </button>
              </div>)}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 text-sm font-medium disabled:opacity-50">
            {isSubmitting ? (<span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </span>) : (<span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4"/>
                Send
              </span>)}
          </Button>
        </form>
      </Card>
    </div>);
}
