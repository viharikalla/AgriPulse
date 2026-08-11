import { FieldAnalysis, SupportedCropName, ResolvedLocation, WeatherSnapshot, User } from '../types';
import { AdvisoryService } from './advisoryService';

const API_BASE_URL = '/api';

export interface AnalyzePayload {
  imageFile?: File | Blob;
  photoUrl?: string;
  crop: SupportedCropName;
  location: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export class ApiClient {
  public static async signup(payload: { name: string; email: string; password: string; confirmPassword: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      const message = json?.error?.message || 'Account registration failed. Please try again.';
      throw new Error(message);
    }
    return json.data.user as User;
  }

  public static async login(payload: { email: string; password: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      const message = json?.error?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
    return json.data.user as User;
  }

  public static async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }

  public static async getMe(): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          return json.data.user as User;
        }
      }
    } catch {
      // Unauthenticated or server offline
    }
    return null;
  }

  public static async searchLocation(query: string): Promise<ResolvedLocation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/location/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.locations)) {
          return json.locations as ResolvedLocation[];
        }
      }
    } catch {
      // Fallback to local Vijayawada location
    }

    return [
      {
        name: 'Vijayawada',
        latitude: 16.5062,
        longitude: 80.648,
        country: 'India',
        admin1: 'Andhra Pradesh',
        timezone: 'Asia/Kolkata',
      },
    ];
  }

  public static async getWeather(latitude: number, longitude: number, locationName?: string): Promise<WeatherSnapshot | null> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
      if (locationName) params.append('locationName', locationName);

      const res = await fetch(`${API_BASE_URL}/weather?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as WeatherSnapshot;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  }

  public static async analyzeField(payload: AnalyzePayload): Promise<FieldAnalysis> {
    try {
      const formData = new FormData();
      formData.append('crop', payload.crop);
      formData.append('location', payload.location);
      if (payload.latitude !== undefined) formData.append('latitude', payload.latitude.toString());
      if (payload.longitude !== undefined) formData.append('longitude', payload.longitude.toString());
      if (payload.notes) formData.append('notes', payload.notes);

      if (payload.imageFile) {
        formData.append('image', payload.imageFile, (payload.imageFile as File).name || 'crop_photo.jpg');
      } else if (payload.photoUrl) {
        try {
          const blob = await fetch(payload.photoUrl).then((r) => r.blob());
          formData.append('image', blob, 'crop_photo.jpg');
        } catch {
          const dummyBlob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
          formData.append('image', dummyBlob, 'crop_photo.jpg');
        }
      } else {
        const dummyBlob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
        formData.append('image', dummyBlob, 'crop_photo.jpg');
      }

      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const code = json?.error?.code || 'ANALYSIS_ERROR';
        let userMessage = json?.error?.message || 'Field analysis service is temporarily unavailable. Please try again.';

        if (res.status === 400) {
          userMessage = json?.error?.message || 'Please upload a supported crop image and select a valid crop.';
        } else if (res.status === 429) {
          userMessage = 'The field analysis service is temporarily busy due to high demand. Please try again shortly.';
        } else if (res.status === 503) {
          userMessage = 'Live weather or field analysis service is temporarily unavailable. Please try again shortly.';
        } else if (res.status >= 500) {
          userMessage = 'An unexpected server error occurred during field analysis. Please try again.';
        }

        const err = new Error(userMessage);
        (err as any).code = code;
        (err as any).status = res.status;
        throw err;
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error('Malformed field analysis response received from server.');
      }

      return json.data as FieldAnalysis;
    } catch (err: any) {
      if (err.code || err.status) {
        throw err;
      }

      // Offline / fallback mock fallback if backend is unreachable
      console.warn('[ApiClient] Backend unreachable, using fallback mock advisory');
      const fallback = AdvisoryService.createAnalysis({
        cropName: payload.crop,
        location: payload.location,
        photoUrl: payload.photoUrl || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
      });
      return fallback;
    }
  }

  public static async getAnalysis(id: string): Promise<FieldAnalysis | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/analysis/${id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as FieldAnalysis;
        }
      }
    } catch {
      // Fallback
    }

    return AdvisoryService.getById(id);
  }

  public static async getHistory(): Promise<FieldAnalysis[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/history`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data as FieldAnalysis[];
        }
      }
    } catch {
      // Fallback
    }

    return AdvisoryService.getHistory();
  }

  public static async askFieldQuestion(question: string, contextCrop?: SupportedCropName, analysisId?: string): Promise<string> {
    try {
      const res = await fetch(`${API_BASE_URL}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, contextCrop, analysisId }),
        credentials: 'include',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.answer) {
          return json.data.answer as string;
        }
      }
    } catch {
      // Fallback
    }

    return 'Agronomic Guidance: Protectant fungicides require at least 2 hours of dry foliage for rainfast uptake. Check weather forecast before spraying.';
  }
}
