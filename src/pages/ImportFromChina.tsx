import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileText, Send, Info, Globe, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

const importSchema = z.object({
  productUrl: z.string().url('Invalid Alibaba/1688/Taobao URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Required for sourcing accuracy').optional().or(z.literal('')),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  preferences: z.string().optional(),
  shippingMethod: z.enum(['Air Freight (Express)', 'Air Freight (Standard)', 'Sea Freight']),
  destination: z.string().min(5, 'Enter city and state'),
  budget: z.string().optional(),
});

type ImportFormData = z.infer<typeof importSchema>;

export function ImportFromChinaPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: { quantity: 1, shippingMethod: 'Air Freight (Standard)' }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ImportFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to submit requests');
        navigate('/login');
        return;
      }

      let imageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('import-requests')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('import-requests').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('china_orders').insert({
        user_id: user.id,
        product_url: data.productUrl,
        image_url: imageUrl,
        description: data.description,
        quantity: data.quantity,
        preferences: { notes: data.preferences },
        shipping_method: data.shippingMethod,
        destination: data.destination,
        budget: data.budget ? parseFloat(data.budget) : null,
        status: 'Pending'
      });

      if (error) throw error;

      toast.success('Import request submitted successfully!');
      navigate('/track');
    } catch (err: any) {
      toast.error(err.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-[#FF5A00] font-bold tracking-[0.1em] text-[10px] mb-4 uppercase bg-[#FF5A00]/5 px-3 py-1 rounded-full">
          <Globe className="h-3.5 w-3.5" /> Worldwide Sourcing Network
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Import from China</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm leading-relaxed">
          Provide a link or image from any top Chinese marketplace. Our professionals source the best factory rates and manage the entire logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[32px] border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-8 sm:p-10 space-y-8">
              {/* Product Info Selection */}
              <div className="space-y-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Marketplace URL (Alibaba, 1688, Taobao)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-300" />
                  <input
                    {...register('productUrl')}
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-primary/20 transition-all"
                    placeholder="https://1688.com/product/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Reference Photo
                  </label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-[24px] hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 transition-all aspect-video flex flex-col items-center justify-center p-4">
                    <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-contain rounded-lg shadow-sm" />
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-xl shadow-sm mb-3">
                          <Upload className="h-6 w-6 text-slate-400 group-hover:text-[#FF5A00] transition-colors" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Upload clear photo</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Sourcing Notes
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:ring-primary/20 transition-all resize-none"
                    placeholder="Specify color, material, branding, or specific quality levels..."
                  />
                  {errors.description && <p className="text-[10px] font-bold text-red-500">{errors.description.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</label>
                  <input
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courier</label>
                  <select
                    {...register('shippingMethod')}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-sm font-bold appearance-none bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option>Air (Express)</option>
                    <option>Air (Cargo)</option>
                    <option>Sea Freight</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget (₦)</label>
                  <input
                    placeholder="Approximate"
                    {...register('budget')}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-3 px-4 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Destination City</label>
                <input
                  {...register('destination')}
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:ring-primary/20 transition-all"
                  placeholder="Street address, City, State"
                />
                {errors.destination && <p className="text-[10px] font-bold text-red-500">{errors.destination.message}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF5A00] text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-50 transition-all shadow-lg shadow-[#FF5A00]/20 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Request Sourcing Quote'}
                  {!isSubmitting && <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-soft">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-8 border-b pb-4">Our Process</h3>
            <div className="space-y-10">
              {[
                { title: 'Information', desc: 'We review your marketplace link or image.', num: '01' },
                { title: 'Quotation', desc: 'Expert sourcing of procurement rates.', num: '02' },
                { title: 'Logistics', desc: 'We verify quality, package, and ship.', num: '03' },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 font-bold text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-100 p-8 rounded-3xl border border-neutral-200 mt-12">
        <h3 className="font-extrabold text-sm uppercase tracking-tight flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-500" /> Pro Tip
        </h3>
        <p className="text-xs font-medium text-neutral-600 leading-relaxed italic">
          "For 1688 and Taobao, links are processed faster. If using image search, ensure the photo is clear with no watermarks."
        </p>
      </div>
    </div>
  );
}
