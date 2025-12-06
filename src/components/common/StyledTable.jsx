import React from 'react';

const StyledTable = ({ renderHeader, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <tr>
              {renderHeader && renderHeader()}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export default StyledTable;
