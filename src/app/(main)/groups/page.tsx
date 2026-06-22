"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Image as ImageIcon, UserPlus, Smile, Globe2, Lock } from 'lucide-react';

export default function GroupsPage() {
    const [groupName, setGroupName] = useState('');
    const [privacy, setPrivacy] = useState('');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
    const privacyDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (privacyDropdownRef.current && !privacyDropdownRef.current.contains(event.target as Node)) {
                setIsPrivacyDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // moc data user
    const currentUser = {
        name: "Quang Du",
        role: "Quản trị viên",
        avatarUrl: "https://github.com/shadcn.png" // placeholder avatar
    };

    return (
        <div className="flex h-screen w-full bg-[#f0f2f5] overflow-hidden text-sm pt-[58px]">
            {/* CỘT BÊN TRÁI - FORM TẠO NHÓM */}
            <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 flex-shrink-0">
                <div className="p-4 border-b border-gray-200">
                    <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1 font-medium">
                        <span className="hover:underline cursor-pointer">Nhóm</span>
                        <span>›</span>
                        <span>Tạo nhóm</span>
                    </div>
                    <h1 className="text-[24px] font-bold text-black">Tạo nhóm</h1>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-6">
                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200" />
                        <div>
                            <div className="font-semibold text-black text-[15px]">{currentUser.name}</div>
                            <div className="text-[13px] text-gray-500">{currentUser.role}</div>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-4">
                        {/* Tên nhóm */}
                        <div className="relative">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className={`peer w-full px-4 pt-5 pb-2 border rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${groupName ? 'border-blue-500' : 'border-gray-300'}`}
                                placeholder=" "
                                required
                            />
                            <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${groupName ? 'text-[11px] top-1.5 text-blue-500' : 'text-[15px] top-3.5 text-gray-500'}`}>
                                Tên nhóm
                            </label>
                        </div>

                        {/* Quyền riêng tư */}
                        <div className="relative" ref={privacyDropdownRef}>
                            <div 
                                onClick={() => setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen)}
                                className={`w-full px-4 py-2 border rounded-lg cursor-pointer flex items-center justify-between bg-white transition-all ${isPrivacyDropdownOpen ? 'ring-2 ring-blue-100 border-blue-500' : 'border-gray-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#e4e6eb] flex items-center justify-center shrink-0">
                                        {privacy === 'public' ? <Globe2 size={20} className="text-black fill-current" /> : privacy === 'private' ? <Lock size={20} className="text-black fill-current" /> : <Globe2 size={20} className="text-gray-500" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[13px] ${privacy ? 'text-[#0866ff]' : 'text-gray-500'} ${privacy ? 'mb-[-2px]' : 'py-2'}`}>
                                            Chọn quyền riêng tư
                                        </span>
                                        {privacy && (
                                            <span className="text-[15px] font-medium text-black">
                                                {privacy === 'public' ? 'Công khai' : 'Riêng tư'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m6 9 6 6 6-6" /></svg>
                            </div>

                            {/* Dropdown Menu */}
                            {isPrivacyDropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.1)] z-50 py-2">
                                    {/* Option Công khai */}
                                    <div 
                                        onClick={() => { setPrivacy('public'); setIsPrivacyDropdownOpen(false); }}
                                        className={`flex items-start gap-3 p-3 cursor-pointer mx-2 rounded-md ${privacy === 'public' ? 'bg-[#f0f2f5]' : 'hover:bg-[#f2f2f2]'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#e4e6eb] flex items-center justify-center shrink-0 mt-1">
                                            <Globe2 size={20} className="text-black fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-[15px] text-black">Công khai</div>
                                            <div className="text-[13px] text-black mt-0.5">
                                                Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.
                                            </div>
                                            <div className="text-[13px] text-gray-500 mt-1">
                                                Tùy theo quy mô và độ tuổi của nhóm, bạn có thể chuyển sang chế độ riêng tư vào lúc khác.
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center mt-2 shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center ${privacy === 'public' ? 'border-[#0866ff]' : 'border-gray-400'}`}>
                                                {privacy === 'public' && <div className="w-2.5 h-2.5 rounded-full bg-[#0866ff]"></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option Riêng tư */}
                                    <div 
                                        onClick={() => { setPrivacy('private'); setIsPrivacyDropdownOpen(false); }}
                                        className={`flex items-start gap-3 p-3 cursor-pointer mx-2 rounded-md ${privacy === 'private' ? 'bg-[#f0f2f5]' : 'hover:bg-[#f2f2f2]'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#e4e6eb] flex items-center justify-center shrink-0 mt-1">
                                            <Lock size={20} className="text-black fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-[15px] text-black">Riêng tư</div>
                                            <div className="text-[13px] text-black mt-0.5">
                                                Chỉ thành viên mới nhìn thấy mọi người trong nhóm và những gì họ đăng.
                                            </div>
                                            <div className="text-[13px] text-gray-500 mt-1">
                                                Bạn có thể chuyển sang chế độ công khai vào lúc khác.
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center mt-2 shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center ${privacy === 'private' ? 'border-[#0866ff]' : 'border-gray-400'}`}>
                                                {privacy === 'private' && <div className="w-2.5 h-2.5 rounded-full bg-[#0866ff]"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mời bạn bè */}
                        <div className="relative mt-2">
                            <input
                                type="text"
                                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Mời bạn bè (không bắt buộc)"
                            />
                            <div className="mt-2 text-[12px] text-gray-500">
                                Gợi ý: <span className="font-medium text-black">Quang Du, Trọng Trí, test dev</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Button */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                    <button
                        disabled={!groupName || !privacy}
                        className={`w-full py-2.5 rounded-md font-semibold transition-colors flex justify-center items-center ${(!groupName || !privacy)
                            ? 'bg-[#e4e6eb] text-[#bcc0c4] cursor-not-allowed'
                            : 'bg-[#0866ff] text-white hover:bg-[#1877f2]'
                            }`}
                    >
                        Tạo
                    </button>
                </div>
            </div>

            {/* CỘT BÊN PHẢI - LIVE PREVIEW */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header Preview */}
                <div className="flex items-center justify-between p-4 bg-white shadow-sm z-0 shrink-0">
                    <div className="font-semibold text-[15px] text-black">Xem trước trên máy tính</div>
                    <div className="flex items-center gap-1 bg-[#f0f2f5] rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Monitor size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Smartphone size={20} />
                        </button>
                    </div>
                </div>

                {/* Preview Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start custom-scrollbar">
                    {/* Preview Card */}
                    <div className={`bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden transition-all duration-300 ${viewMode === 'desktop' ? 'w-full max-w-[1050px]' : 'w-[400px]'}`}>

                        {/* Cover Image Placeholder */}
                        <div className="h-[350px] bg-gradient-to-b from-gray-200 to-gray-300 relative overflow-hidden flex flex-col items-center justify-center">
                            {/* SVG Pattern to mimic the illustration */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <ImageIcon className="text-gray-400 w-24 h-24 mb-4" />
                            <p className="text-gray-500 font-medium">Ảnh bìa nhóm</p>
                        </div>

                        {/* Group Header Info */}
                        <div className="px-8 pt-6 pb-0 border-b border-gray-200">
                            <h2 className="text-[28px] font-bold text-black mb-1 leading-tight">
                                {groupName || 'Tên nhóm'}
                            </h2>
                            <div className="flex items-center text-[#65676b] text-[15px] gap-1 mb-4">
                                {privacy === 'public' ? <Globe2 size={16} /> : privacy === 'private' ? <Lock size={16} /> : null}
                                <span className="font-medium">{privacy === 'public' ? 'Nhóm công khai' : privacy === 'private' ? 'Nhóm riêng tư' : 'Quyền riêng tư của nhóm'}</span>
                                <span className="mx-1">·</span>
                                <span className="font-semibold text-black">1 thành viên</span>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-1">
                                {['Giới thiệu', 'Bài viết', 'Thành viên', 'Sự kiện'].map((tab, idx) => (
                                    <button key={tab} className={`px-4 py-3.5 font-semibold text-[15px] relative ${idx === 0 ? 'text-gray-500 hover:bg-gray-100 rounded-md' : idx === 1 ? 'text-[#0866ff]' : 'text-gray-500 hover:bg-gray-100 rounded-md'}`}>
                                        {tab}
                                        {idx === 1 && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0866ff]"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="bg-[#f0f2f5] p-4 min-h-[400px] flex gap-4 flex-col md:flex-row justify-center">

                            {/* Left Col (Post Composer) */}
                            <div className="flex-1 max-w-[680px] flex flex-col gap-4">
                                <div className="bg-white rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                                    <div className="flex gap-2 mb-3">
                                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        <div className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors rounded-full px-4 py-2 text-[#65676b] text-[15px] cursor-pointer flex items-center">
                                            Bạn đang nghĩ gì?
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-2 flex justify-between px-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 text-[#65676b] font-semibold text-[15px] py-2 hover:bg-[#f0f2f5] rounded-lg transition-colors">
                                            <ImageIcon size={24} className="text-[#45bd62]" /> Ảnh/video
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 text-[#65676b] font-semibold text-[15px] py-2 hover:bg-[#f0f2f5] rounded-lg transition-colors">
                                            <UserPlus size={24} className="text-[#1877f2]" /> Gắn thẻ người khác
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 text-[#65676b] font-semibold text-[15px] py-2 hover:bg-[#f0f2f5] rounded-lg transition-colors">
                                            <Smile size={24} className="text-[#f7b928]" /> Cảm xúc/Hoạt động
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col (About Widget) */}
                            {viewMode === 'desktop' && (
                                <div className="w-[360px] hidden lg:block">
                                    <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                                        <h3 className="font-bold text-[17px] mb-3 text-black">Giới thiệu</h3>
                                        <div className="text-[15px] text-black">
                                            {privacy === 'public' ? 'Bất kỳ ai cũng có thể tìm thấy nhóm này và xem những gì mọi người đăng.' : privacy === 'private' ? 'Chỉ thành viên mới có thể xem mọi người đăng gì.' : 'Bạn chưa chọn quyền riêng tư cho nhóm.'}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}