import { useState, useEffect } from 'react';
import { memorialSchema, type MemorialFormValues } from '@/lib/schemas/memorial-schema';

const STORAGE_KEY = 'memorial_form_data';
const TIMEOUT_MINUTES = 30;

// In-memory fallback for preview environments
let memoryFormData: {
  data?: Partial<MemorialFormValues>;
  timestamp?: number;
} = {};

const isPreviewEnvironment = () => {
  return window.location.hostname.includes('preview--') || 
         window.location.hostname.includes('localhost');
};

const getStoredData = () => {
  try {
    if (isPreviewEnvironment()) {
      console.log('Using in-memory storage for preview environment');
      return memoryFormData;
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    console.warn('Storage access failed, using memory fallback:', error);
    return memoryFormData;
  }
};

const setStoredData = (data: Partial<MemorialFormValues>) => {
  const storageData = {
    data,
    timestamp: Date.now()
  };

  try {
    if (isPreviewEnvironment()) {
      console.log('Saving to in-memory storage:', data);
      memoryFormData = storageData;
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Storage access failed, using memory fallback:', error);
    memoryFormData = storageData;
  }
};

export const useMemorialForm = () => {
  const [formData, setFormData] = useState<Partial<MemorialFormValues>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data, timestamp } = getStoredData();
    if (data && timestamp) {
      const timeElapsed = (Date.now() - timestamp) / 1000 / 60; // minutes
      if (timeElapsed < TIMEOUT_MINUTES) {
        setFormData(data);
      } else {
        // Clear expired data
        if (isPreviewEnvironment()) {
          memoryFormData = {};
        } else {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (error) {
            console.warn('Failed to clear expired data:', error);
          }
        }
      }
    }
  }, []);

  const saveFormData = (data: Partial<MemorialFormValues>) => {
    setFormData(data);
    setStoredData(data);
  };

  const validateForm = async (data: Partial<MemorialFormValues>): Promise<boolean> => {
    try {
      await memorialSchema.parseAsync(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const formattedErrors: Record<string, string> = {};
        zodError.errors?.forEach((err: any) => {
          formattedErrors[err.path[0]] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const clearFormData = () => {
    setFormData({});
    setErrors({});
    if (isPreviewEnvironment()) {
      memoryFormData = {};
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear form data:', error);
      }
    }
  };

  return {
    formData,
    errors,
    saveFormData,
    validateForm,
    clearFormData
  };
};