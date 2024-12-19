import UUID from "pure-uuid";
import base64 from "base-64";

export const generateId = () => base64.encode(new UUID(4).toString()).substring(0, 12);
