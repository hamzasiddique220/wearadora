'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, BadgeCheck, Sparkles, Check, X as XIcon } from 'lucide-react';
import { Review, ReviewStatus } from '@/types';
import { useReviews } from '@/hooks/useReviews';
import { reviewService } from '@/lib/services/reviews';
import { useUIStore } from '@/lib/stores/ui';
import { formatDate } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import AdminReviewForm from '@/components/admin/ReviewForm';

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: 'bg-[#fff3cd] text-[#856404]',
  approved: 'bg-[#d4edda] text-[#155724]',
  rejected: 'bg-[#f8d7da] text-[#721c24]',
};

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[9px] tracking-[0.2em] uppercase ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function AdminReviewsPage() {
  const { reviews, loading } = useReviews();
  const showToast = useUIStore((state) => state.showToast);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const filtered = useMemo(
    () => reviews.filter((r) => filter === 'all' || r.status === filter),
    [reviews, filter]
  );

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => r.status === 'pending').length,
      approved: reviews.filter((r) => r.status === 'approved').length,
      rejected: reviews.filter((r) => r.status === 'rejected').length,
    }),
    [reviews]
  );

  const openCreate = () => {
    setEditingReview(null);
    setFormOpen(true);
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setFormOpen(true);
  };

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    try {
      await reviewService.updateStatus(id, status);
      showToast(`Review ${status}`);
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const toggleFlag = async (review: Review, field: 'verified' | 'featured') => {
    try {
      await reviewService.update(review.id, { [field]: !review[field] });
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await reviewService.delete(id);
      showToast('Review deleted');
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Customer Feedback
          </span>
          <h1 className="font-serif text-4xl mt-2 flex items-center gap-3 flex-wrap">
            Reviews ({reviews.length})
            {counts.pending > 0 && (
              <span className="text-xs tracking-[0.2em] uppercase bg-bronze text-white px-2.5 py-1 rounded-full font-sans font-medium">
                {counts.pending} pending
              </span>
            )}
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {(
            [
              ['all', `All (${reviews.length})`],
              ['pending', `Pending (${counts.pending})`],
              ['approved', `Approved (${counts.approved})`],
              ['rejected', `Rejected (${counts.rejected})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border ${
                filter === key
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white border-stone'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2 !py-2 !px-4"
          >
            <Plus size={14} /> Add Review
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState message="No reviews to show" />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white p-6">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-xl">{r.reviewerName}</h3>
                    <ReviewStatusBadge status={r.status} />
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase text-[#2d6a4f] bg-[#2d6a4f]/10 px-1.5 py-0.5">
                        <BadgeCheck size={11} /> Verified
                      </span>
                    )}
                    {r.featured && (
                      <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.15em] uppercase text-bronze bg-bronze/10 px-1.5 py-0.5">
                        <Sparkles size={11} /> Featured
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-mocha">
                    {r.productName || r.productId} • {formatDate(r.createdAt)}
                    {r.reviewerEmail ? ` • ${r.reviewerEmail}` : ''}
                    {' • '}
                    <span className="uppercase tracking-[0.15em] text-[10px]">
                      {r.source === 'admin' ? 'Added by admin' : 'Customer submitted'}
                    </span>
                  </div>
                </div>
                <StarRating value={r.rating} size={16} />
              </div>

              <p className="text-sm text-charcoal leading-relaxed mb-3 whitespace-pre-line">
                {r.comment}
              </p>

              {r.images && r.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {r.images.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 border border-stone overflow-hidden block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              <div className="flex gap-2 flex-wrap border-t border-stone pt-4">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(r.id, 'approved')}
                    className="px-3 py-2 bg-[#2d6a4f]/10 text-[#2d6a4f] border border-[#2d6a4f]/30 text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5"
                  >
                    <Check size={12} /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusChange(r.id, 'rejected')}
                    className="px-3 py-2 bg-[#c94b4b]/10 text-[#c94b4b] border border-[#c94b4b]/30 text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5"
                  >
                    <XIcon size={12} /> Reject
                  </button>
                )}
                {r.status !== 'pending' && (
                  <button
                    onClick={() => handleStatusChange(r.id, 'pending')}
                    className="px-3 py-2 bg-white border border-stone text-[10px] tracking-[0.2em] uppercase"
                  >
                    Mark Pending
                  </button>
                )}
                <button
                  onClick={() => toggleFlag(r, 'verified')}
                  className={`px-3 py-2 border text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5 ${
                    r.verified
                      ? 'bg-[#2d6a4f]/10 text-[#2d6a4f] border-[#2d6a4f]/30'
                      : 'bg-white border-stone'
                  }`}
                >
                  <BadgeCheck size={12} /> {r.verified ? 'Verified' : 'Mark Verified'}
                </button>
                <button
                  onClick={() => toggleFlag(r, 'featured')}
                  className={`px-3 py-2 border text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5 ${
                    r.featured
                      ? 'bg-bronze/10 text-bronze border-bronze/30'
                      : 'bg-white border-stone'
                  }`}
                >
                  <Sparkles size={12} /> {r.featured ? 'Featured' : 'Mark Featured'}
                </button>
                <button
                  onClick={() => openEdit(r)}
                  className="px-3 py-2 border border-charcoal text-charcoal text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5 hover:bg-charcoal hover:text-cream transition-colors ml-auto"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-3 py-2 bg-[#fee] text-[#c94b4b] border border-[#fcc]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminReviewForm
        review={editingReview}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
