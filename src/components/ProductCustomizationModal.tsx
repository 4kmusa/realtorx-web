import React, { useState, useMemo } from 'react';
import { X, Heart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
export interface SizeOption {
  id: string;
  label: string;
  volume: string;
  price: number;
}

export interface ChoiceOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface AddOn {
  id: string;
  label: string;
  price: number;
}

export interface ProductData {
  name: string;
  tagline: string;
  ingredients: string;
  image: string;
  tag: string;
  basePrice: number;
  sizes: SizeOption[];
  sweetness: ChoiceOption[];
  iceLevels: ChoiceOption[];
  addOns: AddOn[];
}

export interface CartPayload {
  product: string;
  size: SizeOption;
  sweetness: string;
  iceLevel: string;
  addOns: AddOn[];
  quantity: number;
  specialInstructions: string;
  totalPrice: number;
}

interface Props {
  product: ProductData;
  onClose: () => void;
  onAddToCart: (payload: CartPayload) => void;
}

// ─── Component ─────────────────────────────────────────────
export const ProductCustomizationModal: React.FC<Props> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [sweetness, setSweetness] = useState(product.sweetness[0].id);
  const [iceLevel, setIceLevel] = useState(
    product.iceLevels[2]?.id || product.iceLevels[0].id
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [addOnsOpen, setAddOnsOpen] = useState(true);
  const [favorited, setFavorited] = useState(false);

  const addOnsTotal = useMemo(
    () =>
      product.addOns
        .filter((a) => selectedAddOns.includes(a.id))
        .reduce((sum, a) => sum + a.price, 0),
    [selectedAddOns, product.addOns]
  );

  const unitPrice = selectedSize.price + addOnsTotal;
  const total = unitPrice * quantity;

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const reset = () => {
    setSelectedAddOns([]);
    setInstructions('');
    setQuantity(1);
    setSelectedSize(product.sizes[0]);
    setSweetness(product.sweetness[0].id);
  };

  const handleAddToCart = () => {
    onAddToCart({
      product: product.name,
      size: selectedSize,
      sweetness,
      iceLevel,
      addOns: product.addOns.filter((a) => selectedAddOns.includes(a.id)),
      quantity,
      specialInstructions: instructions.trim(),
      totalPrice: total,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-[380px_1fr] max-h-[92vh]">

        {/* ── LEFT: product hero ── */}
        <div className="relative bg-gradient-to-b from-orange-50 via-orange-100 to-orange-200 p-8 flex flex-col justify-between">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setFavorited(!favorited)}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition"
              aria-label="favorite"
            >
              <Heart
                className={`w-5 h-5 ${
                  favorited ? 'fill-red-500 text-red-500' : 'text-slate-700'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition"
              aria-label="close"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-orange-600 mb-2">
              {product.tag}
            </div>
            <h2 className="font-['Bebas Neue'] text-3xl md:text-4xl font-bold text-slate-900 mb-1 uppercase tracking-wider">
              {product.name}
            </h2>
            <p className="text-sm text-slate-600">{product.ingredients}</p>
          </div>
        </div>

        {/* ── RIGHT: options ── */}
        <div className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto p-6 md:p-8 space-y-7 flex-1">

            {/* Size */}
            <section>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 mb-3 uppercase">
                Choose Size
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {product.sizes.map((s) => {
                  const active = selectedSize.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s)}
                      className={`rounded-2xl border-2 p-3 text-left transition ${
                        active
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            active ? 'border-orange-500' : 'border-slate-300'
                          }`}
                        >
                          {active && (
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {s.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mb-1 ml-6">
                        {s.volume}
                      </div>
                      <div className="text-sm font-bold text-slate-900 ml-6">
                        Rs {s.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sweetness */}
            <section>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 mb-3 uppercase">
                Sweetness
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {product.sweetness.map((opt) => {
                  const active = sweetness === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSweetness(opt.id)}
                      className={`rounded-2xl border-2 py-3 px-2 text-center transition ${
                        active
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {opt.sublabel}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Ice Level */}
            <section>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 mb-3 uppercase">
                Ice Level
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {product.iceLevels.map((opt) => {
                  const active = iceLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setIceLevel(opt.id)}
                      className={`rounded-2xl border-2 py-3 text-sm font-semibold transition ${
                        active
                          ? 'border-orange-500 bg-orange-50 text-slate-900'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Add-ons */}
            <section className="border-2 border-orange-300 rounded-2xl overflow-hidden">
              <button
                onClick={() => setAddOnsOpen(!addOnsOpen)}
                className="w-full flex items-center px-4 py-3 bg-white"
              >
                <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                  Add Ons
                </span>
                <span className="text-[10px] text-slate-400 font-medium ml-3 uppercase">
                  Optional
                </span>
                <span className="ml-auto text-slate-500 text-sm">
                  {addOnsOpen ? '▴' : '▾'}
                </span>
              </button>
              {addOnsOpen && (
                <div className="divide-y divide-slate-100">
                  {product.addOns.map((a) => {
                    const checked = selectedAddOns.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAddOn(a.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              checked
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-slate-300'
                            }`}
                          >
                            {checked && (
                              <svg
                                className="w-3 h-3 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm text-slate-800">{a.label}</span>
                        </div>
                        <span className="text-sm text-slate-600">Rs {a.price}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Special Instructions */}
            <section>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 mb-3 uppercase">
                Special Instructions
              </h3>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special requests?"
                className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-500 outline-none px-4 py-3 text-sm"
              />
            </section>
          </div>

          {/* ── Bottom bar ── */}
          <div className="border-t border-slate-200 px-6 md:px-8 py-4 flex items-center gap-3 bg-white">
            <button
              onClick={reset}
              className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 shrink-0"
              aria-label="reset"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border border-slate-200 rounded-full px-2 py-1 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <Minus className="w-4 h-4 text-slate-700" />
              </button>
              <span className="w-6 text-center font-semibold text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-between px-6 transition"
            >
              <span>Rs {total.toLocaleString()}</span>
              <span className="flex items-center gap-2 text-sm tracking-wide">
                ADD TO CART <ShoppingBag className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sample product data (Orango Beetroot Glow) ────────────
export const ORANGO_BEETROOT_GLOW: ProductData = {
  name: 'Beetroot Glow',
  tagline: 'PURE FLAVOR, PURE POP',
  ingredients: 'Beetroot, Apple, Lemon, Guava',
  tag: 'DETOX & HEALTHY',
  image: '/images/beetroot-glow.png', // apni image ka path daalo
  basePrice: 450,
  sizes: [
    { id: 'regular', label: 'Regular', volume: '350ml', price: 450 },
    { id: 'large', label: 'Large', volume: '500ml', price: 570 },
    { id: 'growler', label: 'Growler', volume: '1L', price: 900 },
  ],
  sweetness: [
    { id: 'unsweetened', label: 'Unsweetened', sublabel: 'No sugar' },
    { id: 'light', label: 'Light', sublabel: 'Hint jaggery' },
    { id: 'regular', label: 'Regular', sublabel: 'Balanced' },
  ],
  iceLevels: [
    { id: 'none', label: 'No' },
    { id: 'less', label: 'Less' },
    { id: 'regular', label: 'Regular' },
    { id: 'extra', label: 'Extra' },
  ],
  addOns: [
    { id: 'chia', label: 'Chia Seeds', price: 60 },
    { id: 'whey', label: 'Whey Protein', price: 60 },
    { id: 'moringa', label: 'Moringa Powder', price: 60 },
    { id: 'collagen', label: 'Collagen Peptides', price: 60 },
    { id: 'spirulina', label: 'Spirulina', price: 60 },
    { id: 'flax', label: 'Flax Seeds', price: 60 },
  ],
};
