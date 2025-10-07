import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CreditCard, Smartphone, X, Plus, Check, Trash2, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AnimatePresence } from 'framer-motion';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const banks = ['กรุงไทย', 'ไทยพาณิชย์', 'กสิกรไทย', 'กรุงเทพ', 'กรุงศรี', 'ทีทีบี'];

type AccountType = 'bank' | 'promptpay';

interface BankAccount {
  id: string;
  type: AccountType;
  bankName?: string;
  accountNo: string;
  accountName: string;
  isDefault?: boolean;
}

interface Props {
  onClose: () => void;
  onAccountSelect: (account: BankAccount) => void;
  selectedAccount?: BankAccount | null;
  isOpen?: boolean;
}

const BankAccountManager: React.FC<Props> = ({ onClose, onAccountSelect, selectedAccount, isOpen = true }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<BankAccount, 'id'>>({
    type: 'bank',
    bankName: '',
    accountNo: '',
    accountName: '',
  });
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/bank-account/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setShowAddForm(false);
    setEditingAccount(null);
    setFormData({
      type: 'bank',
      bankName: '',
      accountNo: '',
      accountName: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.accountNo.trim() || !formData.accountName.trim()) {
      toast({ title: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }
  
    if (formData.type === 'bank' && !formData.bankName) {
      toast({ title: 'กรุณาเลือกธนาคาร', variant: 'destructive' });
      return;
    }
  
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันข้อมูลบัญชี',
      message: 'กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนกดยืนยัน เนื่องจากระบบจะไม่รับผิดชอบหากกรอกข้อมูลผิด',
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token');
  
          if (editingAccount) {
            await axios.put(`${BASE_URL}/bank-account/${editingAccount.id}`, formData, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            await axios.post(`${BASE_URL}/bank-account/`, formData, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
  
          await fetchAccounts();
          resetForm();
          toast({ title: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
        } catch (err) {
          console.error('Error saving account:', err);
          toast({ title: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', variant: 'destructive' });
        } finally {
          setLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };  

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบบัญชี',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?',
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token');
  
          await axios.delete(`${BASE_URL}/bank-account/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          await fetchAccounts();
          toast({ title: 'ลบบัญชีเรียบร้อยแล้ว' });
        } catch (err) {
          console.error('Error deleting account:', err);
          toast({ title: 'เกิดข้อผิดพลาดในการลบบัญชี', variant: 'destructive' });
        } finally {
          setLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };  

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      type: account.type,
      bankName: account.bankName || '',
      accountNo: account.accountNo,
      accountName: account.accountName,
    });
    setShowAddForm(true);
  };

  const setDefault = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      setAccounts((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );

      await axios.patch(
        `${BASE_URL}/bank-account/set-default/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );        

      await fetchAccounts();
    } catch (err) {
      console.error('Error setting default account:', err);
      await fetchAccounts();
      alert('เกิดข้อผิดพลาดในการตั้งค่าเริ่มต้น');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
      onClick={() => {
        onClose();
        resetForm();
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-cyan-400/20 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-400/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-cyan-400 flex items-center">
                <CreditCard className="mr-3" size={24} />
                จัดการบัญชีธนาคาร
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
                disabled={loading}
              >
                <X size={20} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl h-12"
                disabled={loading}
              >
                <Plus className="mr-2" size={20} />
                เพิ่มบัญชีใหม่
              </Button>
            )}

            {showAddForm && (
              <Card className="bg-gray-800/50 border-gray-600">
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-cyan-400">ประเภท *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: AccountType) =>
                          setFormData({
                            ...formData,
                            type: value,
                            bankName: value === 'promptpay' ? '' : formData.bankName,
                          })
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder="เลือกประเภทบัญชี" />
                        </SelectTrigger>
                        <SelectContent className="z-[999999999] bg-gray-900">
                          <SelectItem className="cursor-pointer" value="bank">บัญชีธนาคาร</SelectItem>
                          <SelectItem className="cursor-pointer" value="promptpay">พร้อมเพย์</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.type === 'bank' && (
                      <div className="space-y-2">
                        <Label className="text-cyan-400">ธนาคาร *</Label>
                        <Select
                          value={formData.bankName || ''}
                          onValueChange={(value) =>
                            setFormData({ ...formData, bankName: value })
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                            <SelectValue placeholder="เลือกธนาคาร" />
                          </SelectTrigger>
                          <SelectContent className="z-[999999999] bg-gray-900">
                            {banks.map((bank) => (
                              <SelectItem className="cursor-pointer" key={bank} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-cyan-400">
                        {formData.type === 'bank' ? 'เลขที่บัญชี *' : 'เบอร์พร้อมเพย์ *'}
                      </Label>
                      <Input
                        value={formData.accountNo}
                        onChange={(e) =>
                          setFormData({ ...formData, accountNo: e.target.value })
                        }
                        placeholder={formData.type === 'bank' ? '123-4-56789-0' : '08x-xxx-xxxx'}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-cyan-400">ชื่อบัญชี *</Label>
                      <Input
                        value={formData.accountName}
                        onChange={(e) =>
                          setFormData({ ...formData, accountName: e.target.value })
                        }
                        placeholder="ชื่อเจ้าของบัญชี"
                        className="bg-gray-800/50 border-gray-600 text-white"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        <Check className="mr-2" size={16} />
                        {loading ? 'กำลังบันทึก...' : editingAccount ? 'บันทึก' : 'เพิ่ม'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelForm}
                        className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                        disabled={loading}
                      >
                        <X className="mr-2" size={16} />
                        ยกเลิก
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {loading && accounts?.length === 0 ? (
                <div className="text-center text-gray-400 py-8">กำลังโหลดข้อมูล...</div>
              ) : accounts?.length === 0 ? (
                <div className="text-center text-gray-400 py-8">ยังไม่มีบัญชีธนาคาร</div>
              ) : (
                accounts?.map((account) => (
                  <Card
                    key={account.id}
                    className={`cursor-pointer transition-all ${
                      selectedAccount?.id === account.id
                        ? 'bg-cyan-400/20 border-cyan-400'
                        : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                    }`}
                    onClick={() => onAccountSelect(account)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {account.type === 'bank' ? (
                            <CreditCard className="text-cyan-400" size={20} />
                          ) : (
                            <Smartphone className="text-green-400" size={20} />
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {account.type === 'bank' ? account.bankName : 'พร้อมเพย์'}
                            </p>
                            <p className="text-sm text-gray-300">
                              {account.accountNo} - {account.accountName}
                            </p>
                            {account.isDefault && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                ค่าเริ่มต้น
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!account.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefault(account.id);
                              }}
                              className="text-yellow-400 hover:bg-yellow-400/20"
                              disabled={loading}
                            >
                              ตั้งเป็นค่าเริ่มต้น
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(account);
                            }}
                            className="text-cyan-400 hover:bg-cyan-400/20"
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(account.id);
                            }}
                            className="text-red-400 hover:bg-red-400/20"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText="ยืนยัน"
            cancelText="ยกเลิก"
            confirmColor="red"
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );

  function cancelForm() {
    resetForm();
  }
};

export default BankAccountManager;