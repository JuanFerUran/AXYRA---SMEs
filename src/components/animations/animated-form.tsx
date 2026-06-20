'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null;
}

interface AnimatedFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  className?: string;
  vertical?: boolean;
}

export function AnimatedForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className = '',
  vertical = true,
}: AnimatedFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.validation) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${vertical ? 'space-y-4' : 'grid grid-cols-2 gap-4'} ${className}`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="contents"
      >
        {fields.map((field) => (
          <motion.div key={field.name} variants={fieldVariants}>
            <label className="block text-sm font-medium text-foreground">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            <div className="relative mt-1">
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors[field.name]
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:border-primary'
                  }`}
                  rows={3}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors[field.name]
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:border-primary'
                  }`}
                />
              )}
              {errors[field.name] && (
                <motion.div
                  className="mt-1 flex items-center gap-2 text-sm text-red-500"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors[field.name]}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        type="submit"
        disabled={isSubmitting || isSuccess}
        className={`mt-4 w-full rounded-lg px-4 py-2 font-semibold text-white transition-all ${
          isSuccess
            ? 'bg-green-600'
            : isSubmitting
              ? 'bg-primary/50 opacity-50'
              : 'bg-primary hover:bg-primary/90'
        }`}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ opacity: isSuccess ? 1 : 0 }}
        >
          {isSuccess && <CheckCircle className="h-4 w-4" />}
          {isSuccess ? 'Success!' : isSubmitting ? 'Submitting...' : submitLabel}
        </motion.div>
      </motion.button>
    </form>
  );
}
