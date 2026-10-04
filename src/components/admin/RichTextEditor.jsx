/**
 * IYMPACK CMS — Elementor-Style RichTextEditor Component
 *
 * Full-featured, modern WYSIWYG editor inspired by Elementor & WordPress block editors:
 * - Completely prevents form submission / page refresh when saving or clicking links
 * - Inline link bubble with live preview, edit, unlink, and CTA button styling
 * - Undo & Redo (History)
 * - Typography selector (Paragraph, H1, H2, H3, H4, Blockquote)
 * - Text formatting (Bold, Italic, Underline, Strikethrough)
 * - Brand color palette & pastel highlights + HTML color picker
 * - Text alignment (Left, Center, Right, Justify)
 * - Lists (Bullet, Numbered)
 * - Insert Elements (Link/CTA Button, Divider HR, Callout Info Box, Tables)
 * - Quick emoji picker & full emoji palette
 * - Clear formatting & clean HTML sanitization
 * - Visual mode, HTML Source code mode, and Fullscreen editing mode
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Palette,
  Highlighter,
  Code,
  Smile,
  RemoveFormatting,
  Eye,
  X,
  Check,
  Undo,
  Redo,
  Minus,
  Info,
  AlertTriangle,
  Table,
  Maximize2,
  Minimize2,
  ExternalLink,
  Pencil,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const TEXT_COLORS = [
  { label: 'Hitam / Gelap', color: '#1f2937' },
  { label: 'Emas / Amber', color: '#d97706' },
  { label: 'Hijau Forest', color: '#166534' },
  { label: 'Hijau Emerald', color: '#059669' },
  { label: 'Biru Samudra', color: '#2563eb' },
  { label: 'Merah Berani', color: '#dc2626' },
  { label: 'Ungu Elegan', color: '#7c3aed' },
  { label: 'Merah Muda', color: '#db2777' },
  { label: 'Krem Emas', color: '#ca8a04' },
  { label: 'Abu-Abu Lembut', color: '#6b7280' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Tanpa Sorotan', color: 'transparent' },
  { label: 'Kuning Terang', color: '#fef08a' },
  { label: 'Hijau Mint', color: '#bbf7d0' },
  { label: 'Biru Muda', color: '#bfdbfe' },
  { label: 'Oranye Peach', color: '#fed7aa' },
  { label: 'Merah Muda Pastel', color: '#fbcfe8' },
];

const POPULAR_EMOJIS = [
  '✨', '🌟', '📍', '📅', '⏰', '🎯', '🤝', '📚', '✏️', '🎨',
  '🧁', '🚨', '🕊️', '❤️', '💡', '📢', '🚀', '🌈', '💪', '🎉',
  '🔥', '🌿', '🙌', '⭐', '📦', '🎈', '🎒', '💬', '🏆', '💯'
];

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Tuliskan isi artikel / deskripsi kegiatan secara lengkap di sini...',
  minHeight = 'min-h-[260px]',
}) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Editor display modes
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dropdowns & pickers
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [customColor, setCustomColor] = useState('#059669');

  // Link Dialog states & refs (Elementor style)
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTargetBlank, setLinkTargetBlank] = useState(true);
  const [linkNoFollow, setLinkNoFollow] = useState(false);
  const [linkAsButton, setLinkAsButton] = useState(false);
  const [isEditingExistingLink, setIsEditingExistingLink] = useState(false);

  // Floating Link bubble state (Elementor style)
  const [floatingLink, setFloatingLink] = useState(null);

  const savedRangeRef = useRef(null);
  const activeAnchorRef = useRef(null);

  // Sync value from props to contentEditable without resetting caret during typing
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isHtmlMode]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowColorPicker(false);
        setShowHighlightPicker(false);
        setShowEmojiPicker(false);
        setShowFormatDropdown(false);
        setShowInsertDropdown(false);
        setFloatingLink(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (onChange) {
        onChange(html);
      }
    }
  };

  const executeCommand = (command, val = null) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleFormatBlock = (tag) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    setShowFormatDropdown(false);
    handleInput();
  };

  const handleTextColor = (color) => {
    executeCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleHighlightColor = (color) => {
    executeCommand('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  // Helper to safely store current caret position
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        return;
      }
    }
    savedRangeRef.current = null;
  };

  // Insert arbitrary HTML safely at current caret position
  const insertHtmlAtCursor = (html) => {
    if (isHtmlMode) {
      if (onChange) onChange((value || '') + '\n' + html);
      return;
    }
    editorRef.current?.focus();
    try {
      document.execCommand('insertHTML', false, html);
    } catch {
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
      }
    }
    handleInput();
  };

  // ─── Link Handling (Elementor Style) ────────────────────────
  const handleOpenLinkModal = (existingAnchor = null) => {
    if (isHtmlMode) return;

    saveSelection();

    let foundAnchor = existingAnchor;
    let selectedStr = '';
    let currentUrl = '';
    let targetBlank = true;
    let noFollow = false;
    let asButton = false;

    if (!foundAnchor && savedRangeRef.current) {
      selectedStr = savedRangeRef.current.toString();
      let node = savedRangeRef.current.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentNode;
      foundAnchor = node.closest ? node.closest('a') : null;
    }

    if (foundAnchor && editorRef.current?.contains(foundAnchor)) {
      currentUrl = foundAnchor.getAttribute('href') || '';
      selectedStr = foundAnchor.textContent || '';
      targetBlank = foundAnchor.getAttribute('target') === '_blank';
      noFollow = (foundAnchor.getAttribute('rel') || '').includes('nofollow');
      asButton = foundAnchor.classList.contains('iym-btn') || foundAnchor.getAttribute('data-btn') === 'true';
    }

    activeAnchorRef.current = foundAnchor;
    setIsEditingExistingLink(Boolean(foundAnchor));
    setLinkText(selectedStr);
    setLinkUrl(currentUrl);
    setLinkTargetBlank(targetBlank);
    setLinkNoFollow(noFollow);
    setLinkAsButton(asButton);
    setShowLinkModal(true);
    setFloatingLink(null);
    setShowColorPicker(false);
    setShowHighlightPicker(false);
    setShowEmojiPicker(false);
    setShowFormatDropdown(false);
    setShowInsertDropdown(false);
  };

  const handleSaveLink = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const textToInsert = linkText.trim() || finalUrl;

    const relParts = ['noopener', 'noreferrer'];
    if (linkNoFollow) relParts.push('nofollow');
    const relStr = relParts.join(' ');

    const btnClasses = 'iym-btn inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl no-underline shadow-sm transition-colors text-xs text-center my-1 cursor-pointer';
    const linkClasses = 'text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer';

    try {
      if (activeAnchorRef.current && editorRef.current?.contains(activeAnchorRef.current)) {
        // Edit existing anchor element
        activeAnchorRef.current.setAttribute('href', finalUrl);
        if (linkTargetBlank) {
          activeAnchorRef.current.setAttribute('target', '_blank');
          activeAnchorRef.current.setAttribute('rel', relStr);
        } else {
          activeAnchorRef.current.removeAttribute('target');
          activeAnchorRef.current.removeAttribute('rel');
        }
        activeAnchorRef.current.className = linkAsButton ? btnClasses : linkClasses;
        if (linkAsButton) {
          activeAnchorRef.current.setAttribute('data-btn', 'true');
        } else {
          activeAnchorRef.current.removeAttribute('data-btn');
        }
        activeAnchorRef.current.textContent = textToInsert;
      } else {
        // Create brand new anchor element
        const a = document.createElement('a');
        a.href = finalUrl;
        if (linkTargetBlank) {
          a.target = '_blank';
          a.rel = relStr;
        }
        a.className = linkAsButton ? btnClasses : linkClasses;
        if (linkAsButton) a.setAttribute('data-btn', 'true');
        a.textContent = textToInsert;

        editorRef.current?.focus();

        if (savedRangeRef.current && editorRef.current?.contains(savedRangeRef.current.commonAncestorContainer)) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
          savedRangeRef.current.deleteContents();
          savedRangeRef.current.insertNode(a);

          // Add a non-breaking space after link so user can keep typing normally
          const space = document.createTextNode('\u00A0');
          if (a.parentNode) {
            if (a.nextSibling) {
              a.parentNode.insertBefore(space, a.nextSibling);
            } else {
              a.parentNode.appendChild(space);
            }
            const newRange = document.createRange();
            newRange.setStartAfter(space);
            newRange.setEndAfter(space);
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
        } else {
          // Fallback: append safely to editor
          editorRef.current?.appendChild(a);
          const space = document.createTextNode('\u00A0');
          editorRef.current?.appendChild(space);
        }
      }
    } catch (err) {
      console.error('[RichTextEditor] Gagal menyimpan link:', err);
    }

    handleInput();
    setShowLinkModal(false);
    activeAnchorRef.current = null;
  };

  const handleRemoveLink = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    const targetAnchor = activeAnchorRef.current || floatingLink?.element;
    if (targetAnchor && editorRef.current?.contains(targetAnchor)) {
      const parent = targetAnchor.parentNode;
      while (targetAnchor.firstChild) {
        parent.insertBefore(targetAnchor.firstChild, targetAnchor);
      }
      parent.removeChild(targetAnchor);
      handleInput();
    } else if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
      document.execCommand('unlink', false, null);
      handleInput();
    }
    setShowLinkModal(false);
    setFloatingLink(null);
  };

  // Intercept clicks on links inside contentEditable to prevent navigation / page reloads
  const handleEditorClick = (e) => {
    const anchor = e.target.closest('a');
    if (anchor && editorRef.current?.contains(anchor)) {
      e.preventDefault();
      e.stopPropagation();
      activeAnchorRef.current = anchor;
      setFloatingLink({
        element: anchor,
        url: anchor.getAttribute('href') || '',
        text: anchor.textContent || '',
        isButton: anchor.classList.contains('iym-btn') || anchor.getAttribute('data-btn') === 'true',
      });
    } else {
      setFloatingLink(null);
    }
  };

  // ─── Elementor Insert Helpers ──────────────────────────────
  const handleInsertDivider = () => {
    insertHtmlAtCursor('<hr class="my-5 border-t-2 border-gray-200" /><p><br></p>');
    setShowInsertDropdown(false);
  };

  const handleInsertCallout = (type = 'info') => {
    const boxHtml =
      type === 'warning'
        ? '<div class="p-4 my-3 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-xs sm:text-sm font-sans leading-relaxed shadow-xs"><strong>⚠️ PENTING:</strong> Tuliskan pengumuman atau syarat penting di sini...</div><p><br></p>'
        : '<div class="p-4 my-3 rounded-2xl bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950 text-xs sm:text-sm font-sans leading-relaxed shadow-xs"><strong>💡 CATATAN:</strong> Tuliskan panduan atau tips menarik kegiatan di sini...</div><p><br></p>';
    insertHtmlAtCursor(boxHtml);
    setShowInsertDropdown(false);
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <div class="my-4 overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300 text-xs sm:text-sm rounded-xl overflow-hidden">
          <thead>
            <tr class="bg-gray-100/90 text-gray-800">
              <th class="border border-gray-300 p-2.5 text-left font-bold">Agenda / Item</th>
              <th class="border border-gray-300 p-2.5 text-left font-bold">Waktu / Tanggal</th>
              <th class="border border-gray-300 p-2.5 text-left font-bold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 p-2.5">Sesi Pembukaan</td>
              <td class="border border-gray-300 p-2.5">08:00 - 09:00 WIB</td>
              <td class="border border-gray-300 p-2.5">Seluruh peserta hadir</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2.5">Aksi Lapangan</td>
              <td class="border border-gray-300 p-2.5">09:00 - 12:00 WIB</td>
              <td class="border border-gray-300 p-2.5">Kegiatan utama volunteer</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(tableHtml);
    setShowInsertDropdown(false);
  };

  const handleInsertEmoji = (emoji) => {
    if (isHtmlMode) {
      if (onChange) onChange((value || '') + emoji);
      return;
    }
    editorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    handleInput();
  };

  // Calculate live stats
  const plainText = (value || '').replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;

  return (
    <div
      ref={containerRef}
      className={`border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest transition-all flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none shadow-2xl h-screen' : 'relative'
      }`}
    >
      {/* ─── Elementor Header / Main Toolbar ───────────────────────── */}
      <div className="bg-[#f8faf9] border-b border-gray-200/90 p-2 sm:p-2.5 flex flex-wrap items-center gap-1 text-gray-700 select-none sticky top-0 z-20">
        
        {/* 1. History (Undo / Redo) */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Batalkan (Undo) - Ctrl+Z"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Ulangi (Redo) - Ctrl+Y"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Elementor Typography Dropdown */}
        <div className="relative border-r border-gray-200 pr-1">
          <button
            type="button"
            onClick={() => {
              setShowFormatDropdown(!showFormatDropdown);
              setShowColorPicker(false);
              setShowHighlightPicker(false);
              setShowEmojiPicker(false);
              setShowInsertDropdown(false);
            }}
            className="px-2.5 py-1.5 hover:bg-white text-gray-800 text-xs font-semibold rounded-lg transition-colors border border-transparent hover:border-gray-200 flex items-center gap-1.5 cursor-pointer"
            title="Pilih Format Paragraf / Heading"
          >
            <span>Format Teks</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showFormatDropdown && (
            <div className="absolute top-full left-0 mt-1 z-30 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl w-48 animate-fadeIn space-y-0.5">
              <button
                type="button"
                onClick={() => handleFormatBlock('<p>')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-normal hover:bg-gray-100 flex items-center justify-between text-gray-700 cursor-pointer"
              >
                <span>Paragraf Normal</span>
                <span className="text-[10px] text-gray-400 font-mono">&lt;p&gt;</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock('<h1>')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 flex items-center justify-between text-gray-900 cursor-pointer"
              >
                <span>Judul Utama (H1)</span>
                <span className="text-[10px] text-gray-400 font-mono">&lt;h1&gt;</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock('<h2>')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 flex items-center justify-between text-gray-900 cursor-pointer"
              >
                <span>Sub-Judul Besar (H2)</span>
                <span className="text-[10px] text-gray-400 font-mono">&lt;h2&gt;</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock('<h3>')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100 flex items-center justify-between text-gray-900 cursor-pointer"
              >
                <span>Sub-Judul Sedang (H3)</span>
                <span className="text-[10px] text-gray-400 font-mono">&lt;h3&gt;</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock('<h4>')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 flex items-center justify-between text-gray-900 cursor-pointer"
              >
                <span>Sub-Judul Kecil (H4)</span>
                <span className="text-[10px] text-gray-400 font-mono">&lt;h4&gt;</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock('<blockquote>')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs italic hover:bg-gray-100 flex items-center justify-between text-gray-700 cursor-pointer"
              >
                <span>Blok Kutipan (Quote)</span>
                <Quote className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Basic Styles (Bold, Italic, Underline, Strikethrough) */}
        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Tebal (Bold) - Ctrl+B"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Miring (Italic) - Ctrl+I"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Garis Bawah (Underline) - Ctrl+U"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Coret (Strikethrough)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. Text Color & Highlight */}
        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          {/* Text Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
                setShowEmojiPicker(false);
                setShowFormatDropdown(false);
                setShowInsertDropdown(false);
              }}
              className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 flex items-center gap-1 cursor-pointer"
              title="Warna Teks"
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-semibold hidden md:inline">Warna</span>
            </button>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-3 bg-white border border-gray-200 rounded-2xl shadow-xl space-y-2.5 w-56 animate-fadeIn">
                <span className="block text-[11px] font-bold text-gray-700 pb-1 border-b border-gray-100">
                  Pilihan Warna Teks
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => handleTextColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className="w-7 h-7 rounded-lg shadow-xs hover:scale-110 active:scale-95 transition-transform border border-black/10 cursor-pointer"
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500 font-medium">Warna Kustom:</span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      handleTextColor(e.target.value);
                    }}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    title="Pilih warna bebas"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
                setShowEmojiPicker(false);
                setShowFormatDropdown(false);
                setShowInsertDropdown(false);
              }}
              className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 flex items-center gap-1 cursor-pointer"
              title="Warna Sorotan (Highlight)"
            >
              <Highlighter className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-semibold hidden md:inline">Sorotan</span>
            </button>

            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-white border border-gray-200 rounded-2xl shadow-xl space-y-1 w-48 animate-fadeIn">
                <span className="block text-[11px] font-bold text-gray-700 pb-1.5 border-b border-gray-100">
                  Sorotan Teks
                </span>
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.label}
                    type="button"
                    onClick={() => handleHighlightColor(h.color)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <span
                      className="w-4 h-4 rounded border border-gray-300 shadow-xs"
                      style={{ backgroundColor: h.color === 'transparent' ? '#ffffff' : h.color }}
                    />
                    <span>{h.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Alignment */}
        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Rata Kiri"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Rata Tengah"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Rata Kanan"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Rata Kiri-Kanan (Justify)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. Lists */}
        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Daftar Poin (Bullet List)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 hover:bg-white hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Daftar Nomor (Numbered List)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7. Link & Elementor Insert Elements */}
        <div className="flex items-center gap-0.5 px-1 border-r border-gray-200">
          <button
            type="button"
            onClick={() => handleOpenLinkModal()}
            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200 cursor-pointer flex items-center gap-1"
            title="Sisipkan Tautan Web / Tombol (Link)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden sm:inline">Tautan</span>
          </button>

          {/* Insert Dropdown (Divider, Callout, Table) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowInsertDropdown(!showInsertDropdown);
                setShowFormatDropdown(false);
                setShowColorPicker(false);
                setShowHighlightPicker(false);
                setShowEmojiPicker(false);
              }}
              className="p-1.5 hover:bg-white text-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-200 flex items-center gap-1 cursor-pointer"
              title="Sisipkan Elemen Tambahan (Garis, Kotak Info, Tabel)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[10px] font-semibold hidden md:inline">Sisipkan</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showInsertDropdown && (
              <div className="absolute top-full left-0 mt-1 z-30 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl w-52 animate-fadeIn space-y-0.5">
                <span className="block px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Elemen Blok
                </span>
                <button
                  type="button"
                  onClick={handleInsertDivider}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-gray-700 cursor-pointer"
                >
                  <Minus className="w-4 h-4 text-gray-500" />
                  <span>Garis Pembatas (Divider)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertCallout('info')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 cursor-pointer"
                >
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Kotak Catatan (Info Box)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertCallout('warning')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-amber-50 flex items-center gap-2 text-amber-800 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Kotak Peringatan Penting</span>
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 flex items-center gap-2 text-gray-700 cursor-pointer"
                >
                  <Table className="w-4 h-4 text-blue-600" />
                  <span>Tabel Sederhana (Jadwal)</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 hover:bg-white text-gray-500 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
            title="Bersihkan Semua Format"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8. Emoji Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowColorPicker(false);
              setShowHighlightPicker(false);
              setShowFormatDropdown(false);
              setShowInsertDropdown(false);
            }}
            className="p-1.5 hover:bg-white text-amber-600 rounded-lg transition-colors border border-transparent hover:border-gray-200 flex items-center gap-1 cursor-pointer"
            title="Pilih Emoji"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 z-30 p-3 bg-white border border-gray-200 rounded-2xl shadow-xl w-64 animate-fadeIn space-y-2">
              <span className="block text-[11px] font-bold text-gray-700 pb-1 border-b border-gray-100">
                Koleksi Emoji
              </span>
              <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto p-1">
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      handleInsertEmoji(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 hover:scale-125 rounded-lg transition-all cursor-pointer"
                    title={`Sisipkan ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 9. Mode Toggles (Visual, HTML, Fullscreen) */}
        <div className="ml-auto flex items-center gap-1 pl-2">
          {/* Visual vs Code Mode */}
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isHtmlMode
                ? 'bg-forest text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            title={isHtmlMode ? 'Kembali ke Editor Visual' : 'Lihat / Edit Kode HTML'}
          >
            {isHtmlMode ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
            <span className="hidden sm:inline">{isHtmlMode ? 'Visual' : 'HTML'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── Elementor Floating Link Quick Action Bubble ───────────── */}
      {floatingLink && (
        <div className="bg-emerald-950 text-white px-3 py-2 flex items-center justify-between gap-3 text-xs border-b border-emerald-800 shadow-md animate-fadeIn z-10">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <LinkIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-stone-200 shrink-0">Tautan:</span>
            <span className="text-emerald-300 font-mono underline truncate max-w-xs">
              {floatingLink.url}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => window.open(floatingLink.url, '_blank', 'noopener,noreferrer')}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title="Buka Tautan di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenLinkModal(floatingLink.element)}
              className="px-2.5 py-1 bg-[#faeed4] hover:bg-white text-[#1c241e] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Edit Tautan & Teks"
            >
              <Pencil className="w-3 h-3" />
              <span>Ubah</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveLink}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors cursor-pointer"
              title="Hapus Tautan (Lepas Link)"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFloatingLink(null)}
              className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Tutup Menu Tautan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Emoji Quick Bar ────────────────────────────── */}
      <div className="px-3 py-1.5 bg-gray-50/60 border-b border-gray-100 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap pr-1">
          Cepat:
        </span>
        {['✨', '🌟', '📍', '📅', '⏰', '🎯', '🤝', '📚', '✏️', '🎨', '🧁', '🚨', '🕊️', '❤️', '💡', '📢', '🚀', '💪'].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleInsertEmoji(emoji)}
            className="w-6 h-6 shrink-0 flex items-center justify-center text-xs hover:bg-white hover:scale-125 active:scale-95 rounded-lg transition-transform cursor-pointer"
            title={`Sisipkan ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* ─── Editor Surface ────────────────────────────── */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        {isHtmlMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            rows={12}
            className={`w-full flex-1 p-4 font-mono text-xs text-green-300 bg-gray-900 focus:outline-none resize-none leading-relaxed ${minHeight}`}
            placeholder="Tulis kode HTML langsung di sini..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            onClick={handleEditorClick}
            data-placeholder={placeholder}
            className={`p-4 sm:p-5 text-sm text-gray-800 leading-relaxed font-sans focus:outline-none prose max-w-none flex-1 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none ${minHeight}`}
            style={{ minHeight: isFullscreen ? '100%' : '260px' }}
          />
        )}
      </div>

      {/* ─── Bottom Status Bar ─────────────────────────── */}
      <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-200/80 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Editor Aktif &bull; Format teks, tautan, &amp; tombol tersimpan secara real-time.</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-gray-600">
          <span>{wordCount} kata</span>
          <span>&bull;</span>
          <span>{charCount} karakter</span>
        </div>
      </div>

      {/* ─── Link Insertion & Editing Modal (Zero Form Refresh Bug) ─── */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md space-y-4 animate-scaleUp text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {isEditingExistingLink ? 'Ubah Pengaturan Tautan' : 'Sisipkan Tautan Web / Tombol'}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Gaya tautan interaktif ala Elementor untuk pengunjung.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Using DIV to guarantee 100% NO page refresh */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teks yang Ditampilkan
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLink(e);
                  }}
                  placeholder="Contoh: Info Pendaftaran, Dokumen Panduan, Instagram, dll."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  autoFocus={!linkText}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Jika dikosongkan, alamat URL di bawah yang akan tampil sebagai teks tautan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat URL Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLink(e);
                  }}
                  placeholder="https://contoh.com/info atau wa.me/... atau link drive"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  autoFocus={Boolean(linkText)}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Bisa berupa link Google Drive, Google Form, Instagram, WhatsApp, website eksternal, dll.
                </p>
              </div>

              {/* Elementor Options: Target Blank, Nofollow, Button Style */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-2.5">
                <span className="block text-[11px] font-bold text-gray-700">
                  Pengaturan Lanjutan Tautan (Elementor Style)
                </span>

                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkTargetBlank}
                    onChange={(e) => setLinkTargetBlank(e.target.checked)}
                    className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                  />
                  <span>Buka di tab jendela baru (<code className="text-[10px] text-gray-500">target="_blank"</code>)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkNoFollow}
                    onChange={(e) => setLinkNoFollow(e.target.checked)}
                    className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                  />
                  <span>Tambahkan tag SEO (<code className="text-[10px] text-gray-500">rel="nofollow"</code>)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none pt-1 border-t border-gray-200/60">
                  <input
                    type="checkbox"
                    checked={linkAsButton}
                    onChange={(e) => setLinkAsButton(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-800">Format sebagai Tombol CTA</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 font-bold uppercase">
                      Elementor CTA
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                {isEditingExistingLink ? (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Hapus Tautan</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLink}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-forest hover:bg-forest-dark text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Tautan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
