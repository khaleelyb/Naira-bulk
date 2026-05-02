import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import {
  Upload, Trash2, Image as ImageIcon, File, Copy, Check,
  Loader2, Grid3X3, List, Search, Filter, FolderOpen, X,
  Download, Eye, RefreshCw, HardDrive, ChevronDown
} from 'lucide-react';

type BucketName = 'products' | 'import-requests';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  publicUrl?: string;
}

const BUCKETS: { id: BucketName; label: string; icon: string; desc: string }[] = [
  { id: 'products', label: 'Product Assets', icon: '📦', desc: 'Product images & media' },
  { id: 'import-requests', label: 'Import Requests', icon: '🌏', desc: 'User-submitted import images' },
];

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AdminUploads() {
  const [activeBucket, setActiveBucket] = useState<BucketName>('products');
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'other'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [activeBucket]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(activeBucket).list('', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;

      const withUrls = (data || []).map(f => {
        const { data: urlData } = supabase.storage.from(activeBucket).getPublicUrl(f.name);
        return { ...f, publicUrl: urlData.publicUrl } as StorageFile;
      });
      setFiles(withUrls);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (uploadFiles: File[]) => {
    if (!uploadFiles.length) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const file of uploadFiles) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from(activeBucket).upload(fileName, file);
        if (error) throw error;
        successCount++;
      }
      toast.success(`${successCount} file(s) uploaded successfully`);
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(Array.from(e.dataTransfer.files));
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    setDeletingId(fileName);
    try {
      const { error } = await supabase.storage.from(activeBucket).remove([fileName]);
      if (error) throw error;
      toast.success('File deleted');
      setFiles(prev => prev.filter(f => f.name !== fileName));
      if (previewFile?.name === fileName) setPreviewFile(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const isImage = f.metadata?.mimetype?.startsWith('image/');
    const matchesFilter = filterType === 'all' || (filterType === 'image' ? isImage : !isImage);
    return matchesSearch && matchesFilter;
  });

  const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
  const imageCount = files.filter(f => f.metadata?.mimetype?.startsWith('image/')).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Media Vault</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage management & asset control</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFiles}
            className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:border-slate-300 hover:text-slate-700 transition-all shadow-soft"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-3 px-8 py-4 bg-[#FF5A00] text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-60 transition-all shadow-lg shadow-[#FF5A00]/20 active:scale-95"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} accept="image/*,video/*,.pdf" />
        </div>
      </div>

      {/* Bucket Selector + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {BUCKETS.map(bucket => (
          <button
            key={bucket.id}
            onClick={() => setActiveBucket(bucket.id)}
            className={cn(
              "p-6 rounded-[28px] border text-left transition-all",
              activeBucket === bucket.id
                ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10"
                : "bg-white border-slate-100 hover:border-slate-300 shadow-soft"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{bucket.icon}</span>
              {activeBucket === bucket.id && (
                <span className="h-2 w-2 bg-[#FF5A00] rounded-full" />
              )}
            </div>
            <p className={cn("text-sm font-bold tracking-tight", activeBucket === bucket.id ? "text-white" : "text-slate-900")}>
              {bucket.label}
            </p>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", activeBucket === bucket.id ? "text-slate-400" : "text-slate-400")}>
              {bucket.desc}
            </p>
          </button>
        ))}

        {/* Stats Card */}
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-soft p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="h-4 w-4 text-[#FF5A00]" />
              </div>
              <p className="text-xl font-bold text-slate-900">{files.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Files</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">{imageCount}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Images</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <HardDrive className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">{formatBytes(totalSize)}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-soft p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-0 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'image', 'other'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                filterType === f ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400")}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-[32px] p-8 text-center transition-all",
          dragOver ? "border-[#FF5A00] bg-[#FF5A00]/5" : "border-slate-200 hover:border-slate-300"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <Upload className={cn("h-6 w-6 transition-colors", dragOver ? "text-[#FF5A00]" : "text-slate-300")} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {dragOver ? "Drop to upload" : "Drag & drop files here or click Upload Files above"}
          </p>
        </div>
      </div>

      {/* File Grid / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 text-[#FF5A00] animate-spin mb-4" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading assets...</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[32px] border border-slate-100">
          <FolderOpen className="h-12 w-12 text-slate-100 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">No files found</p>
          <p className="text-[11px] text-slate-300 mt-1">Upload files or adjust your search</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredFiles.map(file => {
            const isImage = file.metadata?.mimetype?.startsWith('image/');
            return (
              <div key={file.name} className="group bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-soft hover:shadow-md hover:border-slate-200 transition-all">
                {/* Preview */}
                <div
                  className="aspect-square bg-slate-50 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  onClick={() => setPreviewFile(file)}
                >
                  {isImage ? (
                    <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <File className="h-10 w-10 text-slate-200" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-700 truncate">{file.name}</p>
                  <p className="text-[9px] text-slate-400 font-medium">{formatBytes(file.metadata?.size)}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyUrl(file.publicUrl!)}
                      className="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-slate-50 hover:bg-[#FF5A00]/10 hover:text-[#FF5A00] rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      {copiedUrl === file.publicUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      disabled={deletingId === file.name}
                      className="p-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                    >
                      {deletingId === file.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 text-slate-300 hover:text-red-500" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">File</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uploaded</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFiles.map(file => {
                const isImage = file.metadata?.mimetype?.startsWith('image/');
                return (
                  <tr key={file.name} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                          {isImage ? (
                            <img src={file.publicUrl} className="w-full h-full object-cover" alt={file.name} />
                          ) : (
                            <div className="h-full flex items-center justify-center"><File className="h-5 w-5 text-slate-200" /></div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-lg uppercase tracking-widest">
                        {file.metadata?.mimetype?.split('/')[1] || 'unknown'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-slate-500">{formatBytes(file.metadata?.size)}</td>
                    <td className="px-8 py-4 text-[10px] font-medium text-slate-400">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setPreviewFile(file)} className="p-2 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-slate-300 transition-all shadow-soft">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => copyUrl(file.publicUrl!)} className="p-2 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all shadow-soft">
                          {copiedUrl === file.publicUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(file.name)}
                          disabled={deletingId === file.name}
                          className="p-2 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-soft disabled:opacity-50"
                        >
                          {deletingId === file.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-[40px] overflow-hidden max-w-3xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 truncate max-w-[400px]">{previewFile.name}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatBytes(previewFile.metadata?.size)} · {previewFile.metadata?.mimetype}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            {previewFile.metadata?.mimetype?.startsWith('image/') && (
              <div className="bg-slate-50 flex items-center justify-center p-4 max-h-[60vh] overflow-hidden">
                <img src={previewFile.publicUrl} alt={previewFile.name} className="max-h-full max-w-full object-contain rounded-2xl" />
              </div>
            )}
            <div className="p-6 flex items-center gap-3">
              <button
                onClick={() => copyUrl(previewFile.publicUrl!)}
                className="flex-1 py-3 bg-slate-50 text-slate-700 font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                {copiedUrl === previewFile.publicUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedUrl === previewFile.publicUrl ? 'Copied!' : 'Copy URL'}
              </button>
              <a
                href={previewFile.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-[#FF5A00] text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#E65100] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A00]/20"
              >
                <Download className="h-4 w-4" /> Open / Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
