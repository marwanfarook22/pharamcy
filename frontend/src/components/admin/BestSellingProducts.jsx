import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const BestSellingProducts = ({ orders }) => {
  const productStats = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Aggregate product sales from all orders
    const productMap = new Map();

    orders.forEach((order) => {
      // Only count paid/completed orders
      if (order.status === 'Paid' || order.status === 'Completed') {
        // Handle both Items (from backend) and items (camelCase)
        const orderItems = order.items || order.Items || [];
        if (orderItems.length > 0) {
          orderItems.forEach((item) => {
            const medicineId = item.medicineId;
            const medicineName = item.medicineName;
            const quantity = item.quantity || 0;
            const revenue = item.subTotal || (item.unitPrice * quantity);

            if (productMap.has(medicineId)) {
              const existing = productMap.get(medicineId);
              existing.totalQuantity += quantity;
              existing.totalRevenue += revenue;
              existing.orderCount += 1;
            } else {
              productMap.set(medicineId, {
                medicineId,
                medicineName,
                totalQuantity: quantity,
                totalRevenue: revenue,
                orderCount: 1,
              });
            }
          });
        }
      }
    });

    // Convert to array and sort
    return Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10
  }, [orders]);

  const chartData = useMemo(() => {
    return productStats.map((product) => ({
      name: product.medicineName.length > 20 
        ? product.medicineName.substring(0, 20) + '...' 
        : product.medicineName,
      quantity: product.totalQuantity,
      revenue: parseFloat(product.totalRevenue.toFixed(2)),
      fullName: product.medicineName,
    }));
  }, [productStats]);

  const pieData = useMemo(() => {
    return productStats.slice(0, 5).map((product) => ({
      name: product.medicineName.length > 15 
        ? product.medicineName.substring(0, 15) + '...' 
        : product.medicineName,
      value: product.totalQuantity,
      revenue: product.totalRevenue,
      fullName: product.medicineName,
    }));
  }, [productStats]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.fullName}</p>
          <p className="text-sm text-gray-600">
            Quantity: <span className="font-medium">{payload[0].value}</span>
          </p>
          {payload[0].payload.revenue && (
            <p className="text-sm text-gray-600">
              Revenue: <span className="font-medium">${payload[0].payload.revenue.toFixed(2)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (productStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span>Best Selling Products</span>
        </h2>
        <p className="text-gray-500 text-center py-8">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-primary-600" />
        <span>Best Selling Products</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart - Quantity Sold */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary-600" />
            <span>Top Products by Quantity Sold</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="quantity" fill="#6366f1" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Revenue Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Revenue Distribution (Top 5)</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: <span className="font-medium">{payload[0].value}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Revenue: <span className="font-medium">${payload[0].payload.revenue.toFixed(2)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Sales Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productStats.map((product, index) => (
                <tr key={product.medicineId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-primary-100 text-primary-800'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.medicineName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {product.totalQuantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${product.totalRevenue.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.orderCount} orders
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      ${(product.totalRevenue / product.totalQuantity).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BestSellingProducts;

