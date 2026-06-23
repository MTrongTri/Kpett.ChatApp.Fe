"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Shield,
  Users,
  MessageSquare,
  Lock,
  Image as ImageIcon,
  MoreVertical,
  Check,
  X,
  UserCheck,
  UserMinus,
  Ban,
  Crown,
  Search,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";

// Lấy mockup data thay vì gọi API để làm UI tĩnh demo trước
const MOCK_MEMBERS = [
  { id: "1", name: "Nguyễn Văn A", username: "nguyenvana", role: "admin", avatar: "" },
  { id: "2", name: "Trần Thị B", username: "tranthib", role: "moderator", avatar: "" },
  { id: "3", name: "Lê Văn C", username: "levanc", role: "member", avatar: "" },
];

const MOCK_PENDING_USERS = [
  { id: "4", name: "Phạm D", username: "phamd", requestedAt: "10 phút trước" },
];

const MOCK_PENDING_POSTS = [
  {
    id: "p1",
    author: { name: "Hoàng E", username: "hoange" },
    content: "Cho mình hỏi nhóm này có nội quy cụ thể không ạ?",
    createdAt: "1 giờ trước",
  },
];

// Các Tab quản lý
type AdminTab = "general" | "permissions" | "members" | "pending_posts";

export default function GroupManagePage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const [activeTab, setActiveTab] = useState<AdminTab>("general");

  // State Settings (Mock)
  const [groupName, setGroupName] = useState("Cộng đồng Kpett ChatApp");
  const [description, setDescription] = useState("Nhóm thảo luận chính thức của ứng dụng Kpett.");
  const [privacy, setPrivacy] = useState("public");
  
  // State Toggles
  const [requirePostApproval, setRequirePostApproval] = useState(true);
  const [requireMemberApproval, setRequireMemberApproval] = useState(false);

  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-[#f8f9fa]">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/groups/${groupId}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý nhóm</h1>
              <p className="text-sm text-gray-500">Thiết lập và kiểm duyệt hoạt động của nhóm</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full bg-white">
            Xem nhóm
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          
          {/* ── Sidebar Navigation ── */}
          <div className="space-y-1">
            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Cài đặt</h3>
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                activeTab === "general" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Settings size={18} />
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                activeTab === "permissions" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Shield size={18} />
              Quyền & Phê duyệt
            </button>

            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 mt-6 mb-2">Kiểm duyệt</h3>
            <button
              onClick={() => setActiveTab("members")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                activeTab === "members" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Users size={18} />
                Thành viên
              </div>
              {MOCK_PENDING_USERS.length > 0 && (
                <span className="bg-red-100 text-red-600 text-[11px] px-2 py-0.5 rounded-full">
                  {MOCK_PENDING_USERS.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pending_posts")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                activeTab === "pending_posts" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                Bài đăng chờ duyệt
              </div>
              {MOCK_PENDING_POSTS.length > 0 && (
                <span className="bg-red-100 text-red-600 text-[11px] px-2 py-0.5 rounded-full">
                  {MOCK_PENDING_POSTS.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Main Content Area ── */}
          <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm min-h-[600px] overflow-hidden">
            
            {/* TAB: THÔNG TIN CHUNG */}
            {activeTab === "general" && (
              <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Thông tin chung</h2>
                  <p className="text-sm text-gray-500 mt-1">Quản lý tên, mô tả và hình ảnh của nhóm.</p>
                </div>

                <div className="space-y-6">
                  {/* Thay đổi ảnh bìa & avatar */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Hình ảnh nhóm</label>
                    <div className="h-40 w-full rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-indigo-600">Thay đổi ảnh bìa</span>
                      </div>
                    </div>
                  </div>

                  {/* Tên nhóm */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tên nhóm</label>
                    <Input 
                      value={groupName} 
                      onChange={(e) => setGroupName(e.target.value)} 
                      className="h-12 rounded-xl"
                    />
                  </div>

                  {/* Mô tả */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mô tả nhóm</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Quyền riêng tư */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Quyền riêng tư</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setPrivacy("public")}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          privacy === "public" ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 hover:border-indigo-300"
                        )}
                      >
                        <Globe2 size={24} className={privacy === "public" ? "text-indigo-600" : "text-gray-400"} />
                        <h4 className="font-bold text-gray-900 mt-2">Công khai</h4>
                        <p className="text-xs text-gray-500 mt-1">Bất kỳ ai cũng có thể xem thành viên và bài viết.</p>
                      </div>
                      <div 
                        onClick={() => setPrivacy("private")}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          privacy === "private" ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 hover:border-indigo-300"
                        )}
                      >
                        <Lock size={24} className={privacy === "private" ? "text-indigo-600" : "text-gray-400"} />
                        <h4 className="font-bold text-gray-900 mt-2">Riêng tư</h4>
                        <p className="text-xs text-gray-500 mt-1">Chỉ thành viên mới có thể xem nội dung trong nhóm.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl">
                      Xóa nhóm này
                    </Button>
                    <Button className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700">
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: QUYỀN & PHÊ DUYỆT */}
            {activeTab === "permissions" && (
              <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quyền & Phê duyệt</h2>
                  <p className="text-sm text-gray-500 mt-1">Kiểm soát ai được phép tham gia và đăng bài trong nhóm.</p>
                </div>

                <div className="space-y-6">
                  {/* Cài đặt bài viết */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Bài đăng</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Phê duyệt bài viết</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Yêu cầu Quản trị viên duyệt bài trước khi hiển thị trên nhóm.</p>
                      </div>
                      <Switch 
                        checked={requirePostApproval} 
                        onCheckedChange={setRequirePostApproval}
                      />
                    </div>
                  </div>

                  {/* Cài đặt thành viên */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Thành viên</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Phê duyệt người tham gia</h4>
                        <p className="text-sm text-gray-500 mt-0.5">Admin phải phê duyệt mọi yêu cầu xin vào nhóm.</p>
                      </div>
                      <Switch 
                        checked={requireMemberApproval} 
                        onCheckedChange={setRequireMemberApproval}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: QUẢN LÝ THÀNH VIÊN */}
            {activeTab === "members" && (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="p-6 lg:p-8 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Quản lý Thành viên</h2>
                  <p className="text-sm text-gray-500 mt-1">Xem, cấp quyền và chặn thành viên.</p>
                </div>

                <div className="px-6 py-4 flex gap-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Tìm thành viên..." className="pl-9 h-10 rounded-xl bg-white" />
                  </div>
                  <Button variant="outline" className="rounded-xl bg-white">
                    Yêu cầu tham gia (1)
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {MOCK_MEMBERS.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ id: member.id, displayName: member.name, username: member.username }} className="h-10 w-10" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            {member.name}
                            {member.role === "admin" && <Crown size={14} className="text-amber-500" />}
                            {member.role === "moderator" && <Shield size={14} className="text-blue-500" />}
                          </p>
                          <p className="text-xs text-gray-500">@{member.username}</p>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 rounded-lg">
                        <MoreVertical size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BÀI ĐĂNG CHỜ DUYỆT */}
            {activeTab === "pending_posts" && (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="p-6 lg:p-8 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Bài đăng chờ duyệt</h2>
                  <p className="text-sm text-gray-500 mt-1">Duyệt hoặc từ chối các bài viết được gửi bởi thành viên.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
                  {MOCK_PENDING_POSTS.length > 0 ? (
                    <div className="space-y-4">
                      {MOCK_PENDING_POSTS.map(post => (
                        <div key={post.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <UserAvatar user={{ id: post.id, displayName: post.author.name, username: post.author.username }} className="h-10 w-10" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{post.author.name}</p>
                              <p className="text-xs text-gray-500">{post.createdAt}</p>
                            </div>
                          </div>
                          <p className="text-gray-800 text-[15px] mb-5">{post.content}</p>
                          <div className="flex gap-2">
                            <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                              <Check size={18} className="mr-2" /> Duyệt bài
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100">
                              <X size={18} className="mr-2" /> Từ chối
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Không có bài viết nào cần duyệt</h3>
                      <p className="text-sm text-gray-500 mt-1">Tất cả đều đã được xử lý xong!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
