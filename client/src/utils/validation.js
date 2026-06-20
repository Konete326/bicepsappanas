export const validators = {
  name: (v) => {
    if (!v || !v.trim()) return "This field is required";
    if (!/^[a-zA-Z\s.'-]+$/.test(v)) return "Only letters, spaces, dots and hyphens allowed";
    return "";
  },
  rollNo: (v) => {
    if (!v || !v.trim()) return "Roll No is required";
    if (!/^[a-zA-Z0-9/-]+$/.test(v)) return "Only letters, numbers, dash and slash allowed";
    return "";
  },
  email: (v) => {
    if (!v || !v.trim()) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
    return "";
  },
  phone: (v) => {
    if (!v || !v.trim()) return "Phone number is required";
    const cleaned = v.replace(/[\s-]/g, "");
    if (!/^\+?\d{10,15}$/.test(cleaned)) return "Enter a valid phone number (10-15 digits)";
    return "";
  },
  positiveNum: (v) => {
    if (v === "" || v === undefined || v === null) return "This field is required";
    if (isNaN(v) || Number(v) <= 0) return "Must be a positive number";
    return "";
  },
  nonNegNum: (v) => {
    if (v === "" || v === undefined || v === null) return "This field is required";
    if (isNaN(v) || Number(v) < 0) return "Cannot be negative";
    return "";
  },
  height: (v) => {
    if (!v || !v.trim()) return "Height is required";
    if (!/^\d+(\.\d{1,2})?$/.test(v)) return "Format: feet.inches (e.g. 5.7)";
    if (parseFloat(v) > 8) return "Height seems too tall";
    if (parseFloat(v) < 2) return "Height seems too short";
    return "";
  },
  measurement: (v) => {
    if (v === "" || v === undefined || v === null) return "This field is required";
    if (isNaN(v) || Number(v) <= 0) return "Must be a positive number";
    if (Number(v) > 100) return "Value seems too high";
    return "";
  },
  age: (v) => {
    if (v === "" || v === undefined || v === null) return "Age is required";
    const n = parseInt(v);
    if (isNaN(n) || n <= 0) return "Must be a valid age";
    if (n > 120) return "Age seems invalid";
    return "";
  },
  text: (v) => {
    if (!v || !v.trim()) return "This field is required";
    if (!/^[a-zA-Z0-9\s,.'#/-]+$/.test(v)) return "Contains invalid characters";
    return "";
  },
};

export const getErrClass = (errors, field) =>
  errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";
