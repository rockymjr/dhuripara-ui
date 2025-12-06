// src/components/vdf/VdfPublicExpenses.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useLanguage } from '../../context/LanguageContext';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import VdfExpenseForm from './VdfExpenseForm';
import { ChevronLeft, ChevronRight, Package, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VdfPublicExpenses = () => {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { isAuthenticated: isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, [page]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await vdfService.getPublicExpenses(page, 20);
      setExpenses(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching VDF expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await vdfService.getExpenseCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <Loader message="Loading VDF expenses..." />;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package size={32} className="text-orange-600 mr-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Village Development Fund - Expenses
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button
              onClick={() => { setEditingExpense(null); setShowForm(true); }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <Plus size={18} />
              <span className="text-sm">Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {expenses && expenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{expense.description}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(expense.expenseDate)}</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                {expense.categoryName}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(expense.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <StyledTable
        renderHeader={() => (
          <>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Category</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Description</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount</th>
          </>
        )}
      >
        {expenses && expenses.length === 0 ? (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No expenses found</td>
          </tr>
        ) : (
          expenses && expenses.map((expense) => (
            <tr key={expense.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.expenseDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  {expense.categoryName}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                {formatCurrency(expense.amount)}
              </td>
            </tr>
          ))
        )}
      </StyledTable>

      {/* Pagination */}
      <div className="mt-4 sm:mt-6 flex items-center justify-between">
        <p className="text-xs sm:text-sm text-gray-700">
          Page <span className="font-medium">{page + 1}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Expense Form Modal (admin only) */}
      {showForm && isAdmin && (
        <VdfExpenseForm
          expense={editingExpense}
          categories={categories}
          onClose={(shouldRefresh) => {
            setShowForm(false);
            setEditingExpense(null);
            if (shouldRefresh) fetchExpenses();
          }}
        />
      )}
    </div>
  );
};

export default VdfPublicExpenses;