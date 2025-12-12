// src/components/admin/vdf/VdfExpenseManagement.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from "../../services/vdfService";
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { Package, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Info } from 'lucide-react';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import VdfExpenseForm from './VdfExpenseForm';
import { useAuth } from '../../context/AuthContext';

const VdfExpenseManagement = () => {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedNotes, setSelectedNotes] = useState(null);
  const { isAuthenticated: isAdmin } = useAuth();

  useEffect(() => {
    console.log('VdfExpenseManagement mounted');
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear]);

  const fetchCategories = async () => {
    try {
      const data = await vdfService.getExpenseCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await vdfService.getAllExpenses(selectedYear);
      console.log('Fetched expenses:', data);
      // Handle both paginated and non-paginated responses
      const expenses = Array.isArray(data) ? data : (data.content || []);
      console.log('Setting expenses:', expenses);
      setExpenses(expenses);
      setTotalPages(1); // Backend returns all expenses for the year, no pagination
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert(t('errorFetching'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingExpense(null);
    if (shouldRefresh) {
      fetchExpenses();
    }
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await vdfService.deleteExpense(expenseId);
        fetchExpenses();
        alert(t('deleted'));
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert(t('errorDeleting'));
      }
    }
  };

  // Calculate summary - expenses are already filtered by year from backend
  const filteredExpenses = expenses || [];

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const expensesByCategory = (categories || []).map(cat => ({
    name: cat.categoryName,
    total: filteredExpenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(item => item.total > 0);

  console.log('Rendering VdfExpenseManagement - loading:', loading, 'expenses:', expenses);
  if (loading) return <Loader message={t('loadingExpenses')} />;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-orange-600" />
          <h2 className="text-lg font-bold text-gray-800">{t('vdfExpenses')}</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t('add')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 mb-4 text-white">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Total Expenses {selectedYear}</span>
          <span className="text-xl font-bold">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>

      {/* Expenses by Category */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
          <div className="px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-semibold">
            By Category
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expensesByCategory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{item.name}</td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-600">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Category</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
                <th className="px-3 py-2 text-center font-semibold">Notes</th>
                {isAdmin && <th className="px-3 py-2 text-center font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-3 py-3 text-center text-gray-500">
                    {t('noExpensesFound')}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap text-xs sm:text-sm">{formatDate(expense.expenseDate)}</td>
                    <td className="px-3 py-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800 whitespace-nowrap">
                        {expense.categoryName}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-xs text-xs sm:text-sm">
                      {expense.description || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-600 whitespace-nowrap text-xs sm:text-sm">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {expense.notes ? (
                        <button
                          onClick={() => setSelectedNotes(expense.notes)}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                          title="View notes"
                        >
                          <Info size={16} />
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      {selectedNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Notes</h3>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap break-words">{selectedNotes}</p>
            <button
              onClick={() => setSelectedNotes(null)}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <VdfExpenseForm
          expense={editingExpense}
          categories={categories}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default VdfExpenseManagement;