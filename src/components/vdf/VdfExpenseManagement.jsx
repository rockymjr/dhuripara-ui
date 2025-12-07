// src/components/admin/vdf/VdfExpenseManagement.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from "../../services/vdfService";
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { Package, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import VdfExpenseForm from './VdfExpenseForm';
import { useAuth } from '../../context/AuthContext';

const VdfExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { isAuthenticated: isAdmin } = useAuth();

  useEffect(() => {
    console.log('VdfExpenseManagement mounted');
    fetchCategories();
    fetchExpenses();
  }, []);

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
      const data = await vdfService.getAllExpenses(page, 100);
      console.log('Fetched expenses:', data);
      // Handle both paginated and non-paginated responses
      const expenses = Array.isArray(data) ? data : (data.content || []);
      console.log('Setting expenses:', expenses);
      setExpenses(expenses);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Failed to load expenses');
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
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await vdfService.deleteExpense(expenseId);
        fetchExpenses();
        alert('Expense deleted successfully');
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  // Calculate summary
  const filteredExpenses = (expenses || []).filter(exp => {
    const expDate = new Date(exp.expenseDate);
    const yearMatch = expDate.getFullYear() === selectedYear;
    return yearMatch;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const expensesByCategory = (categories || []).map(cat => ({
    name: cat.categoryName,
    total: filteredExpenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(item => item.total > 0);

  console.log('Rendering VdfExpenseManagement - loading:', loading, 'expenses:', expenses);
  if (loading) return <Loader message="Loading expenses..." />;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 md:mb-6 gap-2">
        <div className="flex items-center gap-2">
          <Package size={24} className="text-orange-600" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Expenses</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="bg-orange-600 hover:bg-orange-700 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg flex items-center space-x-1 transition text-sm md:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards - Total This Year in Table Format */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-3 md:mb-6">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="px-3 py-2 text-sm md:text-base font-medium text-gray-700">Total This Year:</td>
              <td className="px-3 py-2 text-sm md:text-base font-bold text-orange-600 text-right">{formatCurrency(totalExpenses)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Category Summary - Table Format */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-3 md:mb-6 overflow-x-auto">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">Expense by Category</h3>
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b-2 border-orange-300">
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Category</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {expensesByCategory.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 odd:bg-gray-50 hover:bg-gray-100">
                  <td className="px-3 py-2 text-gray-800">{item.name}</td>
                  <td className="px-3 py-2 text-right font-semibold text-orange-600">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500 text-sm">
            No expenses found for selected filters
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-lg shadow p-3 group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{expense.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(expense.expenseDate)}</p>
                </div>
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-orange-100 text-orange-800 whitespace-nowrap ml-2">
                  {expense.categoryName}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(expense.amount)}</span>
              </div>
              {expense.notes && (
                <div className="text-xs text-gray-500 italic mb-2 group-hover:text-gray-700 transition">
                  📝 {expense.notes}
                </div>
              )}
              {isAdmin && (
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded-lg flex items-center justify-center transition text-xs"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg flex items-center justify-center transition text-xs"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Description</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-white uppercase tracking-wide">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
            </>
          )}
        >
          {filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No expenses found for selected filters</td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => (
              <tr key={expense.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 group">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(expense.expenseDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                    {expense.categoryName}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="max-w-xs">
                    <p>{expense.description}</p>
                    {expense.notes && (
                      <p className="text-xs text-gray-500 italic mt-1 group-hover:text-gray-700 transition">
                        📝 {expense.notes}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-orange-600 text-right">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {isAdmin ? (
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                        title="Edit expense"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          )}
        </StyledTable>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{page + 1}</span> of{' '}
            <span className="font-medium">{totalPages}</span> (showing {filteredExpenses.length} of {expenses.length} expenses)
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