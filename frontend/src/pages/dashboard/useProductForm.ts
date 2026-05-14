import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import { toast } from '../../utils/toast';
import { validateField } from './productFormValidation';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrl: string;
  imageFile: File | null;
}

export interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  categoryId?: string;
  imageFile?: string;
}

export interface Category {
  id: number;
  name: string;
}

export { validateField };

export function useProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '', imageFile: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    apiService.get<Category[]>('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    apiService.get(`/api/products/${id}`)
      .then((res) => {
        const p = res.data;
        setFormData({
          name: p.name, description: p.description,
          price: String(p.price), stock: String(p.stock),
          categoryId: String(p.categoryId), imageUrl: p.imageUrl || '',
          imageFile: null,
        });
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = useCallback((field: keyof ProductFormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [touched]);

  const handleBlur = useCallback((field: keyof ProductFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'imageFile' ? formData.imageFile : formData[field];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, [formData]);

  const handleSubmit = async () => {
    const newTouched: Record<string, boolean> = {};
    const newErrors: FormErrors = {};
    const fields: (keyof ProductFormData)[] = ['name', 'description', 'price', 'stock', 'categoryId', 'imageFile'];
    fields.forEach((field) => {
      newTouched[field] = true;
      const value = field === 'imageFile' ? formData.imageFile : formData[field];
      const error = validateField(field, value);
      if (error) (newErrors as Record<string, string>)[field] = error;
    });
    setTouched(newTouched);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: formData.imageUrl || null,
      };

      const fd = new FormData();
      fd.append('product', new Blob([JSON.stringify(productPayload)], { type: 'application/json' }));
      if (formData.imageFile) {
        fd.append('image', formData.imageFile);
      }

      if (isEdit) {
        await apiService.put(`/api/products/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        await apiService.post('/api/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully');
      }
      navigate('/dashboard/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const message = error?.response?.data?.error || 'Failed to save product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, errors, touched, categories, loading, fetching, isEdit,
    handleChange, handleBlur, handleSubmit,
  };
}
