// src/components/admin/vdf/VdfExpenseManagement.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from "../../services/vdfService";
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { Package, Plus, Edit, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
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

  // Calculate summary
  const filteredExpenses = (expenses || []).filter(exp => {
    const expDate = new Date(exp.expenseDate);
    const yearMatch = expDate.getFullYear() === selectedYear;
    const monthMatch = selectedMonth === 0 || expDate.getMonth() === selectedMonth - 1;
    return yearMatch && monthMatch;
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package size={32} className="text-orange-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">VDF Expense Management</h2>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Expenses (This Page)</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Categories</h3>
          <p className="text-3xl font-bold mt-2">{categories.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">
            {selectedMonth === 0 ? 'Selected Year' : 'Selected Month'}
          </h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total This Year</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(
              (expenses || [])
                .filter(exp => new Date(exp.expenseDate).getFullYear() === selectedYear)
                .reduce((sum, exp) => sum + exp.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Year and Month Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <Filter size={20} className="text-gray-600 hidden md:block flex-shrink-0" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={0}>All Months</option>
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('default', {month: 'long'})}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Summary */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Expense by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expensesByCategory.map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-sm text-gray-600">{item.name}</p>
                <p className="text-lg font-semibold text-orange-600">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            No expenses found for selected filters
          </div>
        ) : (
          filteredExpenses.map((expense) => (
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
                {expense.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span>{expense.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
            </>
          )}
        >
          {filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No expenses found for selected filters</td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => (
              <tr key={expense.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(expense.expenseDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    {expense.categoryName}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isAdmin ? (
                    <button
                      onClick={() => { setEditingExpense(expense); setShowForm(true); }}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
                      title="Edit expense"
                    >
                      <Edit size={16} />
                      <span className="text-sm">Edit</span>
                    </button>
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