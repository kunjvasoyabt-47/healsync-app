import api from "../lib/axios";
import { Doctor } from "../interfaces/doctor.interface";

export const doctorService = {
  getDoctors: async (name?: string, specialty?: string, city?: string): Promise<Doctor[]> => {
    try {
      const response = await api.get("/doctors", {
        params: {
          name: name || undefined,
          specialty: specialty || undefined, 
          city: city || undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Call Failed:", error);
      throw error;
    }
  },
};