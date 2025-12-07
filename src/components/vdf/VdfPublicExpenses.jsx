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
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 md:mb-6 gap-2">
        <div className="flex items-center gap-2">
          <Package size={24} className="text-orange-600" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            Expenses
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => { setEditingExpense(null); setShowForm(true); }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg flex items-center space-x-1 transition text-sm md:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Compact Table View */}
      <div className="sm:hidden overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="px-3 py-2 text-left text-xs font-semibold border border-orange-500">Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border border-orange-500">Category</th>
              <th className="px-3 py-2 text-right text-xs font-semibold border border-orange-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses && expenses.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-3 py-3 text-center text-gray-500 text-xs border border-gray-200">No expenses found</td>
              </tr>
            ) : (
              expenses && expenses.map((expense) => (
                <tr key={expense.id} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
                  <td className="px-3 py-2 text-xs text-gray-700 border border-gray-200">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="px-3 py-2 text-xs border border-gray-200">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800 whitespace-nowrap">
                      {expense.categoryName}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-orange-600 border border-gray-200 text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
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
      </div>

      {/* Pagination */}
      <div className="mt-3 md:mt-6 flex items-center justify-between text-xs md:text-sm">
        <p className="text-gray-700">
          Page <span className="font-medium">{page + 1}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <div className="flex space-x-1 md:space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="p-1 md:p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-1 md:p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
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