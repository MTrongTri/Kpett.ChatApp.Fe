"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Image as ImageIcon, UserPlus, Smile, Globe2, Lock, X, Loader2, Users, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { getFriendsWithFilter } from "@/services/friend.service";
import { createGroup } from "@/services/group.service";
import { CreateGroupRequest } from "@/types/group";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { UserAvatar } from "@/components/user/user-avatar";
import { useAuth } from "@/components/providers/auth-provider";

export default function CreateGroupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [groupName, setGroupName] = useState('');
    const [privacy, setPrivacy] = useState('');
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
    const privacyDropdownRef = useRef<HTMLDivElement>(null);

    const [friendSearch, setFriendSearch] = useState('');
    const debouncedFriendSearch = useDebounce(friendSearch, 300);
    const [selectedFriends, setSelectedFriends] = useState<UserProfile[]>([]);
    const [isFriendInputFocused, setIsFriendInputFocused] = useState(false);

    const { data: friendsData, isLoading: isSearchingFriends } = useQuery({
        queryKey: ['friends-search', debouncedFriendSearch],
        queryFn: () => getFriendsWithFilter({ search: debouncedFriendSearch, cursor: null, limit: 10 }),
    });

    const friendSuggestions = friendsData?.items?.filter(friend => !selectedFriends.some(selected => selected.id === friend.id)) || [];

    const { mutate: createGroupMutation, isPending: isCreatingGroup } = useMutation({
        mutationFn: (data: CreateGroupRequest) => createGroup(data),
        onSuccess: (data) => {
            toast.success("Tạo nhóm thành công!");
            router.push(`/groups/${data.id}`);
        },
        onError: (error: Error) => {
            toast.error(error?.message || "Đã có lỗi xảy ra khi tạo nhóm");
        }
    });

    const handleCreateGroup = () => {
        if (!groupName || !privacy || isCreatingGroup) return;

        createGroupMutation({
            name: groupName,
            type: privacy,
            language: "vi",
            rules: [],
            inviteeIds: selectedFriends.map(f => f.id)
        });
    };

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

    if (!user) return null;

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-roboto pt-[58px]">
            {/* CỘT BÊN TRÁI - FORM TẠO NHÓM */}
            <div className="w-[380px] bg-card border-r border-border flex flex-col h-full shadow-sm z-10 flex-shrink-0">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2 text-primary mb-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Users size={20} className="text-primary" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Cộng đồng Kpett</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Tạo nhóm mới</h1>
                    <p className="text-sm text-muted-foreground mt-2">Xây dựng cộng đồng của riêng bạn trên Kpett.</p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-8 bg-muted/30 p-3 rounded-2xl border border-border">
                        <img src={user.avatarUrl ?? ""} alt="Avatar" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                        <div>
                            <div className="font-bold text-foreground text-[15px]">{user.displayName}</div>
                            <div className="text-[13px] text-muted-foreground font-medium">Quản trị viên nhóm</div>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-6">
                        {/* Tên nhóm */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-foreground/80 ml-1">Tên nhóm</label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className={`w-full px-4 py-3.5 bg-muted/30 border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${groupName ? 'border-primary' : 'border-border'}`}
                                placeholder="Nhập tên nhóm của bạn..."
                                required
                            />
                        </div>

                        {/* Quyền riêng tư */}
                        <div className="space-y-1.5 relative" ref={privacyDropdownRef}>
                            <label className="text-sm font-bold text-foreground/80 ml-1">Quyền riêng tư</label>
                            <div
                                onClick={() => setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen)}
                                className={`w-full px-4 py-3 bg-muted/30 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${isPrivacyDropdownOpen ? 'ring-2 ring-primary/20 border-primary bg-background' : 'border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${privacy ? 'bg-primary/10' : 'bg-muted'}`}>
                                        {privacy === 'public' ? <Globe2 size={20} className="text-primary" /> : privacy === 'private' ? <Lock size={20} className="text-primary" /> : <Globe2 size={20} className="text-muted-foreground" />}
                                    </div>
                                    <div className="flex flex-col">
                                        {!privacy ? (
                                            <span className="text-[14px] text-muted-foreground font-medium">
                                                Chọn quyền riêng tư
                                            </span>
                                        ) : (
                                            <span className="text-[15px] font-bold text-foreground">
                                                {privacy === 'public' ? 'Công khai' : 'Riêng tư'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isPrivacyDropdownOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}><path d="m6 9 6 6 6-6" /></svg>
                            </div>

                            {/* Dropdown Menu */}
                            {isPrivacyDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-2xl shadow-lg z-50 py-2 overflow-hidden">
                                    {/* Option Công khai */}
                                    <div
                                        onClick={() => { setPrivacy('public'); setIsPrivacyDropdownOpen(false); }}
                                        className={`flex items-start gap-4 p-3.5 cursor-pointer mx-2 rounded-xl transition-all ${privacy === 'public' ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center shrink-0 mt-0.5 border border-border">
                                            <Globe2 size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[15px] text-foreground">Công khai</div>
                                            <div className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                                                Bất kỳ ai cũng có thể tìm thấy và xem nội dung trong nhóm.
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center mt-2 shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${privacy === 'public' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                                {privacy === 'public' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option Riêng tư */}
                                    <div
                                        onClick={() => { setPrivacy('private'); setIsPrivacyDropdownOpen(false); }}
                                        className={`flex items-start gap-4 p-3.5 cursor-pointer mx-2 rounded-xl transition-all ${privacy === 'private' ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center shrink-0 mt-0.5 border border-border">
                                            <Lock size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[15px] text-foreground">Riêng tư</div>
                                            <div className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                                                Chỉ thành viên mới có thể xem nội dung và những người trong nhóm.
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center mt-2 shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${privacy === 'private' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                                {privacy === 'private' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option Ẩn */}
                                    <div
                                        onClick={() => { setPrivacy('hidden'); setIsPrivacyDropdownOpen(false); }}
                                        className={`flex items-start gap-4 p-3.5 cursor-pointer mx-2 rounded-xl transition-all ${privacy === 'hidden' ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center shrink-0 mt-0.5 border border-border">
                                            <Lock size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[15px] text-foreground">Ẩn</div>
                                            <div className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                                                Chỉ thành viên mới có thể tìm thấy và xem nội dung nhóm.
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center mt-2 shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${privacy === 'hidden' ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                                {privacy === 'hidden' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mời bạn bè */}
                        <div className="space-y-1.5 relative">
                            <label className="text-sm font-bold text-foreground/80 ml-1">Mời bạn bè (Tùy chọn)</label>

                            {/* Selected Friends Chips */}
                            {selectedFriends.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedFriends.map(friend => (
                                        <div key={friend.id} className="flex items-center gap-2 bg-primary/10 border border-primary/20 pl-1.5 pr-2.5 py-1.5 rounded-full text-[13px] font-semibold text-primary animate-in fade-in zoom-in duration-200">
                                            <UserAvatar user={{ ...friend, id: friend.id, username: friend.username, displayName: friend.displayName, avatarUrl: friend.avatarUrl }} className="w-6 h-6 border border-background shadow-sm" />
                                            <span>{friend.displayName || friend.username}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFriends(prev => prev.filter(p => p.id !== friend.id));
                                                }}
                                                className="text-primary/60 hover:text-primary hover:bg-primary/5 rounded-full p-0.5 transition-colors"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="text"
                                    value={friendSearch}
                                    onChange={(e) => setFriendSearch(e.target.value)}
                                    onFocus={() => setIsFriendInputFocused(true)}
                                    onBlur={() => setTimeout(() => setIsFriendInputFocused(false), 200)}
                                    className="w-full px-4 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all placeholder:text-muted-foreground"
                                    placeholder="Tìm kiếm bạn bè..."
                                />
                                {isSearchingFriends && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 size={18} className="animate-spin text-primary" />
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Suggestions */}
                            {isFriendInputFocused && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-2xl shadow-lg z-50 max-h-[250px] overflow-y-auto py-2">
                                    {friendSuggestions.length > 0 ? (
                                        friendSuggestions.map(friend => (
                                            <div
                                                key={friend.id}
                                                onClick={() => {
                                                    setSelectedFriends(prev => [...prev, friend]);
                                                    setFriendSearch('');
                                                }}
                                                className="flex items-center gap-3 p-2.5 mx-2 hover:bg-primary/5 rounded-xl cursor-pointer transition-colors"
                                            >
                                                <UserAvatar user={{ ...friend, id: friend.id, username: friend.username, displayName: friend.displayName, avatarUrl: friend.avatarUrl }} className="w-9 h-9 shadow-sm border border-border" />
                                                <span className="text-[14px] font-bold text-foreground">{friend.displayName || friend.username}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-[14px] text-muted-foreground text-center font-medium">
                                            {isSearchingFriends ? "Đang tìm kiếm..." : "Không tìm thấy bạn bè"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer Button */}
                <div className="p-6 border-t border-border bg-background/80 backdrop-blur-md shrink-0">
                    <button
                        onClick={handleCreateGroup}
                        disabled={!groupName || !privacy || isCreatingGroup}
                        className={`w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${(!groupName || !privacy || isCreatingGroup)
                            ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none hover:shadow-none hover:translate-y-0'
                            : 'bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90'
                            }`}
                    >
                        {isCreatingGroup ? (
                            <Loader2 size={18} className="animate-spin mr-2" />
                        ) : (
                            <Sparkles size={18} className="mr-2" />
                        )}
                        {isCreatingGroup ? 'Đang tạo...' : 'Tạo Nhóm Kpett'}
                    </button>
                </div>
            </div>

            {/* CỘT BÊN PHẢI - LIVE PREVIEW */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/20">
                {/* Header Preview */}
                <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-lg border-b border-border shadow-sm z-0 shrink-0">
                    <div className="font-bold text-[15px] text-foreground flex items-center gap-2">
                        <Monitor size={18} className="text-primary" />
                        Giao diện xem trước
                    </div>
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl shadow-sm border border-border">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'desktop' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'mobile' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>

                {/* Preview Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start custom-scrollbar">
                    {/* Preview Card */}
                    <div className={`bg-card/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-border overflow-hidden transition-all duration-500 ease-out flex flex-col ${viewMode === 'desktop' ? 'w-full max-w-[1000px]' : 'w-[400px]'}`}>

                        {/* Cover Image Placeholder */}
                        <div className="h-[280px] md:h-[320px] bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 relative overflow-hidden flex flex-col items-center justify-center m-3 md:m-4 rounded-[1.5rem] shadow-inner">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                                <div className="absolute bottom-10 -left-10 w-48 h-48 bg-white rounded-full blur-2xl"></div>
                            </div>
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 mb-4 z-10">
                                <ImageIcon className="text-white w-12 h-12" />
                            </div>
                            <p className="text-white/90 font-bold text-lg tracking-wide shadow-sm z-10">Ảnh bìa nhóm (Tùy chỉnh sau)</p>
                        </div>

                        {/* Group Header Info */}
                        <div className="px-6 md:px-10 pt-2 pb-6 border-b border-border">
                            <h2 className="text-[32px] wrap-break-word break-all font-extrabold text-foreground mb-2 leading-tight">
                                {groupName || 'Tên nhóm của bạn'}
                            </h2>
                            <div className="flex items-center text-muted-foreground text-[15px] gap-2 mb-6 font-medium">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-foreground/80">
                                    {privacy === 'public' ? <Globe2 size={16} className="text-primary" /> : <Lock size={16} className={privacy === 'hidden' ? 'text-rose-500' : 'text-primary'} />}
                                    {privacy === 'public' ? 'Công khai' : privacy === 'private' ? 'Riêng tư' : privacy === 'hidden' ? 'Ẩn' : 'Chưa thiết lập'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                <span className="text-foreground font-bold">1 thành viên</span>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {['Trang chủ', 'Giới thiệu', 'Thảo luận', 'Thành viên'].map((tab, idx) => (
                                    <button key={tab} className={`px-5 py-2.5 font-bold text-[14px] rounded-xl whitespace-nowrap transition-all ${idx === 0 ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="bg-muted/20 p-6 md:p-8 flex-1 flex gap-6 flex-col md:flex-row justify-center">

                            {/* Left Col (Post Composer) */}
                            <div className="flex-1 max-w-[600px] flex flex-col gap-6">
                                <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border">
                                    <div className="flex gap-3 mb-4">
                                        <img src={user.avatarUrl ?? ""} alt="Avatar" className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-background" />
                                        <div className="flex-1 bg-muted/30 hover:bg-muted/50 border border-border transition-colors rounded-2xl px-5 py-3 text-muted-foreground text-[15px] cursor-pointer flex items-center font-medium">
                                            Chia sẻ điều gì đó với nhóm...
                                        </div>
                                    </div>
                                    <div className="border-t border-border pt-3 flex justify-between px-1">
                                        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground font-bold text-[14px] py-2 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                                            <ImageIcon size={20} className="text-green-500" /> Ảnh/Video
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground font-bold text-[14px] py-2 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                                            <Smile size={20} className="text-yellow-500" /> Cảm xúc
                                        </button>
                                    </div>
                                </div>

                                {/* Dummy Post */}
                                <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border opacity-60">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                                            <div className="h-2 w-16 bg-muted rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-3 w-full bg-muted rounded animate-pulse"></div>
                                        <div className="h-3 w-4/5 bg-muted rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-40 w-full bg-muted/30 rounded-xl animate-pulse"></div>
                                </div>
                            </div>

                            {/* Right Col (About Widget) */}
                            {viewMode === 'desktop' && (
                                <div className="w-[320px] hidden lg:block space-y-6">
                                    <div className="bg-card rounded-[1.5rem] p-6 shadow-sm border border-border">
                                        <h3 className="font-extrabold text-[16px] mb-4 text-foreground flex items-center gap-2">
                                            Về nhóm này
                                        </h3>
                                        <div className="text-[14px] text-muted-foreground leading-relaxed font-medium bg-muted/30 p-4 rounded-xl">
                                            {privacy === 'public' ? 'Mọi người đều có thể tham gia và xem các cuộc thảo luận sôi nổi tại đây.' : privacy === 'private' ? 'Không gian kín đáo, chỉ dành cho các thành viên được phê duyệt.' : 'Hãy chọn quyền riêng tư để thiết lập không gian cho nhóm.'}
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
