'use client';

// ===========================================
// FoundIt — Report Item Multi-Step Form
// ===========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { createLostItem, createFoundItem, updateLostItem, updateFoundItem } from '@/actions/items';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { DynamicLocationPicker } from '@/components/maps';
import { LocationSearch } from '@/components/maps/LocationSearch';
import { defaultCategories, itemColours } from '@/lib/config';
import { 
  Camera, MapPin, AlignLeft, ShieldAlert, CheckCircle2, 
  ChevronRight, ChevronLeft, Loader2, Info
} from 'lucide-react';

interface ReportFormProps {
  type: 'lost' | 'found';
  itemId?: string;
  initialData?: any;
}

export function ReportForm({ type, itemId, initialData }: ReportFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    categoryId: initialData?.categoryId || '',
    publicDescription: initialData?.publicDescription || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    colour: initialData?.colour || '',
    quantity: initialData?.quantity || 1,
    dateEvent: initialData ? (type === 'lost' ? new Date(initialData.dateLost) : new Date(initialData.dateFound)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    timeEvent: initialData ? (type === 'lost' ? initialData.timeLost : initialData.timeFound) || '' : '',
    dateApproximate: initialData?.dateApproximate || false,
    
    // Location
    latitude: initialData?.latitude || (null as number | null),
    longitude: initialData?.longitude || (null as number | null),
    locationName: initialData?.area || '',
    locationUncertain: initialData?.locationUncertain || false,
    
    // Lost specific
    distinguishingFeatures: initialData?.distinguishingFeatures || '',
    rewardOffered: initialData?.rewardOffered || false,
    rewardDescription: initialData?.rewardDescription || '',
    
    // Found specific
    privateVerificationDetail: initialData?.privateVerificationDetail || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);

  // ─── Step Validation ─────────────────────────────
  
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title || formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
      if (!formData.categoryId) newErrors.categoryId = 'Category is required';
      if (!formData.publicDescription || formData.publicDescription.length < 10) newErrors.publicDescription = 'Description must be at least 10 characters';
    } 
    else if (step === 2) {
      if (!formData.latitude || !formData.longitude) newErrors.location = 'Please select a location on the map';
    }
    else if (step === 3 && type === 'found') {
      if (!formData.privateVerificationDetail || formData.privateVerificationDetail.length < 5) {
        newErrors.privateVerificationDetail = 'Please provide a private detail for verification';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  // ─── Image Handling ─────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 3) {
        addToast('warning', 'You can upload a maximum of 3 images.');
        return;
      }
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Submission ─────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }

    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload Images
      const uploadedImages = [];
      if (images.length > 0) {
        for (const file of images) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          
          try {
            const res = await fetch('/api/uploads', {
              method: 'POST',
              body: uploadFormData
            });
            const data = await res.json();
            if (data.success && data.file) {
              uploadedImages.push(data.file);
            }
          } catch (err) {
            console.error('Image upload failed', err);
          }
        }
      }

      // 2. Submit item details
      let result;
      if (type === 'lost') {
        const payload = {
          title: formData.title,
          categoryId: formData.categoryId,
          publicDescription: formData.publicDescription,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          colour: formData.colour || undefined,
          quantity: formData.quantity,
          dateLost: formData.dateEvent,
          timeLost: formData.timeEvent || undefined,
          dateApproximate: formData.dateApproximate,
          latitude: formData.latitude,
          longitude: formData.longitude,
          locationUncertain: formData.locationUncertain,
          distinguishingFeatures: formData.distinguishingFeatures || undefined,
          rewardOffered: formData.rewardOffered,
          rewardDescription: formData.rewardDescription || undefined,
          contactPreference: 'in_app' as const,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        };
        
        if (itemId) {
          result = await updateLostItem({ id: itemId, ...payload });
        } else {
          result = await createLostItem(payload);
        }
      } else {
        const payload = {
          title: formData.title,
          categoryId: formData.categoryId,
          publicDescription: formData.publicDescription,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          colour: formData.colour || undefined,
          dateFound: formData.dateEvent,
          timeFound: formData.timeEvent || undefined,
          dateApproximate: formData.dateApproximate,
          latitude: formData.latitude,
          longitude: formData.longitude,
          privateVerificationDetail: formData.privateVerificationDetail,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        };
        
        if (itemId) {
          result = await updateFoundItem({ id: itemId, ...payload });
        } else {
          result = await createFoundItem(payload);
        }
      }

      if (!result.success) {
        addToast('error', result.error || `Failed to ${itemId ? 'update' : 'create'} listing`);
        setIsSubmitting(false);
        return;
      }

      addToast('success', `Listing ${itemId ? 'updated' : 'created'} successfully!`);
      router.push(`/${type}/${result.data?.slug}`);
      
    } catch (error) {
      addToast('error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Step {step} of 3</span>
          <span className="text-sm font-medium text-[var(--color-primary-600)]">
            {step === 1 ? 'Details' : step === 2 ? 'Location' : 'Finalize'}
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-primary-500)] transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-sm p-6 sm:p-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-primary)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">What was {type}?</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Provide the basic details of the item.</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Title *"
                  placeholder="e.g., iPhone 13 Pro Max in black case"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={errors.title}
                />

                <Select
                  label="Category *"
                  options={defaultCategories.map(c => ({ value: c.slug, label: c.name }))}
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  error={errors.categoryId}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Brand (Optional)"
                    placeholder="e.g., Apple, Nike"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                  <Select
                    label="Colour (Optional)"
                    options={itemColours.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                    value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Public Description *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] min-h-[120px] text-sm"
                    placeholder={type === 'found' 
                      ? "Describe the item. DO NOT include sensitive details (like serial numbers or lock screen images) that an owner would need to verify ownership."
                      : "Describe the item in detail. Include any scratches, unique marks, or contents."}
                    value={formData.publicDescription}
                    onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
                  />
                  {errors.publicDescription && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.publicDescription}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={`Date ${type === 'lost' ? 'Lost' : 'Found'} *`}
                    value={formData.dateEvent}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, dateEvent: e.target.value })}
                  />
                  <Input
                    type="time"
                    label="Approximate Time"
                    value={formData.timeEvent}
                    onChange={(e) => setFormData({ ...formData, timeEvent: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Location & Images */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-primary)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Where was it {type}?</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Pinpoint the location and add photos.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Location *
                  </label>
                  <LocationSearch 
                    onLocationSelect={(lat, lng, name) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, locationName: name }))}
                    className="mb-4"
                  />
                  <div className="h-[300px] w-full rounded-xl overflow-hidden border border-[var(--border-primary)] relative z-0">
                    <DynamicLocationPicker 
                      initialPosition={formData.latitude ? [formData.latitude, formData.longitude!] : undefined}
                      onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                  </div>
                  {errors.location && <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.location}</p>}
                </div>

                {type === 'lost' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                      checked={formData.locationUncertain}
                      onChange={(e) => setFormData(prev => ({ ...prev, locationUncertain: e.target.checked }))}
                    />
                    <span className="text-sm">I&apos;m not exactly sure where I lost it (approximate area)</span>
                  </label>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Photos (Max 3)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl border border-[var(--border-primary)] overflow-hidden group">
                        <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-colors flex flex-col items-center justify-center cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-primary-600)]">
                        <Camera className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">Add Photo</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" multiple onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Verification & Security */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-primary)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Security & Verification</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Final details to ensure a safe return.</p>
                </div>
              </div>

              {type === 'found' ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[var(--color-info-light)] border border-[var(--color-info)]/20">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-[var(--color-info)] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-info)]">Crucial Step: Verification Detail</h4>
                        <p className="text-sm mt-1 text-[var(--color-info)]/80">
                          To prevent fraudsters from claiming this item, provide a secret detail that <strong>only the true owner would know</strong>. This will NOT be shown publicly. We will use this to verify their claim.
                        </p>
                        <p className="text-sm mt-2 text-[var(--color-info)]/80 font-medium">
                          Examples: Lock screen wallpaper, exact IMEI, specific scratch on the back, unique contents of a wallet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      Private Verification Detail *
                    </label>
                    <textarea
                      className={`w-full px-4 py-3 rounded-xl border bg-[var(--bg-primary)] focus:outline-none focus:ring-2 min-h-[100px] text-sm ${errors.privateVerificationDetail ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--border-primary)] focus:ring-[var(--color-primary-500)]'}`}
                      placeholder="Only the true owner knows that..."
                      value={formData.privateVerificationDetail}
                      onChange={(e) => setFormData({ ...formData, privateVerificationDetail: e.target.value })}
                    />
                    {errors.privateVerificationDetail && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.privateVerificationDetail}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      Distinguishing Features (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] min-h-[100px] text-sm"
                      placeholder="Any serial numbers, unique identifiers, or very specific features..."
                      value={formData.distinguishingFeatures}
                      onChange={(e) => setFormData({ ...formData, distinguishingFeatures: e.target.value })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                        checked={formData.rewardOffered}
                        onChange={(e) => setFormData(prev => ({ ...prev, rewardOffered: e.target.checked }))}
                      />
                      <span className="font-medium">I am offering a reward for the return of this item</span>
                    </label>

                    {formData.rewardOffered && (
                      <Input
                        label="Reward Description"
                        placeholder="e.g., $50 cash, a coffee, etc."
                        value={formData.rewardDescription}
                        onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-[var(--border-primary)] flex justify-between items-center">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={prevStep} 
            disabled={step === 1 || isSubmitting}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {step < 3 && (
            <Button 
              key="continue-btn"
              type="button" 
              onClick={nextStep}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue
            </Button>
          )}

          {step === 3 && (
            <Button 
              key="submit-btn"
              type="submit" 
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? (itemId ? 'Saving...' : 'Publishing...') : (itemId ? 'Save Changes' : 'Publish Listing')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
