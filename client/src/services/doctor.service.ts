import api from "../lib/axios";
import { Doctor } from "../interfaces/doctor.interface";

export const doctorService = {

  getDoctors: async (search?: string, specialty?: string, city?: string): Promise<Doctor[]> => {
    try {

      const params = new URLSearchParams();
      
      if (search) params.append("search", search);
      if (specialty) params.append("specialty", specialty);
      if (city) params.append("city", city); 
      // 2. Make the GET request
      const response = await api.get(`/doctors?${params.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors in service:", error);
      throw error;
    }
  },
};