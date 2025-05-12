import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, getUsers, getSkills, updateBooking } from '../utils/localStorage';
import { format } from 'date-fns';
import { MessageSquare, Video, Calendar, CheckCircle, XCircle, Play, Check } from 'lucide-react';
import Chat from "../components/Chat";
import { VideoCall } from '../components/VideoCall';
import toast from 'react-hot-toast';

export const BookingDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const bookings = getBookings();
  const users = getUsers();
  const skills = getSkills();

  const userBookings = bookings.filter(
    booking => booking.learnerId === user?.id || booking.teacherId === user?.id
  );

  const currentDate = new Date();
  const upcomingBookings = userBookings.filter(
    booking => new Date(booking.date) >= currentDate && booking.status !== 'completed'
  );
  const pastBookings = userBookings.filter(
    booking => new Date(booking.date) < currentDate || booking.status === 'completed'
  );

  const getOtherUserDetails = (booking: any) => {
    const isLearner = booking.learnerId === user?.id;
    const otherUserId = isLearner ? booking.teacherId : booking.learnerId;
    return users.find(u => u.id === otherUserId);
  };

  const getSkillDetails = (skillId: string) => {
    return skills.find(s => s.id === skillId);
  };

  const handleBookingAction = (bookingId: string, status: 'confirmed' | 'ongoing' | 'completed' | 'cancelled') => {
    const updates: any = { status };
    
    if (status === 'ongoing') {
      updates.startTime = new Date().toISOString();
    } else if (status === 'completed') {
      updates.endTime = new Date().toISOString();
    }
    
    updateBooking(bookingId, updates);
    const actionText = status.charAt(0).toUpperCase() + status.slice(1);
    toast.success(`Session ${actionText} successfully`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Booking Dashboard</h1>
            <p className="text-purple-100 mt-1">Manage your teaching and learning sessions</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-100">
            <nav className="flex">
              <button
                className={`${
                  activeTab === 'upcoming'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Sessions
              </button>
              <button
                className={`${
                  activeTab === 'past'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200`}
                onClick={() => setActiveTab('past')}
              >
                Past Sessions
              </button>
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            <div className="space-y-4">
              {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(booking => {
                const otherUser = getOtherUserDetails(booking);
                const skill = getSkillDetails(booking.skillId);
                const isTeacher = booking.teacherId === user?.id;
                
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-purple-100 p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{skill?.title}</h3>
                        </div>
                        <p className="text-purple-600">
                          {booking.learnerId === user?.id ? 'Learning from' : 'Teaching'}{' '}
                          <span className="font-medium">{otherUser?.name}</span>
                        </p>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {format(new Date(booking.date), 'PPP p')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {activeTab === 'upcoming' && (
                          <>
                            {isTeacher && booking.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                                  title="Confirm Booking"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                                  title="Cancel Booking"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleBookingAction(booking.id, 'ongoing')}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
                                title="Start Session"
                              >
                                <Play className="h-5 w-5" />
                              </button>
                            )}
                            {booking.status === 'ongoing' && (
                              <button
                                onClick={() => handleBookingAction(booking.id, 'completed')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                                title="Complete Session"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBooking(booking.id);
                                setShowChat(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
                              title="Open Chat"
                            >
                              <MessageSquare className="h-5 w-5" />
                            </button>
                            {booking.status === 'ongoing' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking.id);
                                  setShowVideoCall(true);
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-200"
                                title="Start Video Call"
                              >
                                <Video className="h-5 w-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} sessions
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'upcoming' 
                      ? "You don't have any upcoming sessions scheduled"
                      : "You haven't completed any sessions yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showChat && selectedBooking && (
        <Chat
          bookingId={selectedBooking}
          onClose={() => {
            setShowChat(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showVideoCall && selectedBooking && (
        <VideoCall
          bookingId={selectedBooking}
          onClose={() => {
            setShowVideoCall(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};




// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { getBookings, getUsers, getSkills, updateBooking } from '../utils/localStorage';
// import { format } from 'date-fns';
// import { MessageSquare, Video, Calendar, CheckCircle, XCircle, Play, Check } from 'lucide-react';
// import Chat  from "../components/Chat";
// import { VideoCall } from '../components/VideoCall';
// import toast from 'react-hot-toast';

// export const BookingDashboard = () => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
//   const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
//   const [showChat, setShowChat] = useState(false);
//   const [showVideoCall, setShowVideoCall] = useState(false);

//   const bookings = getBookings();
//   const users = getUsers();
//   const skills = getSkills();

//   const userBookings = bookings.filter(
//     booking => booking.learnerId === user?.id || booking.teacherId === user?.id
//   );

//   const currentDate = new Date();
//   const upcomingBookings = userBookings.filter(
//     booking => new Date(booking.date) >= currentDate && booking.status !== 'completed'
//   );
//   const pastBookings = userBookings.filter(
//     booking => new Date(booking.date) < currentDate || booking.status === 'completed'
//   );

//   const getOtherUserDetails = (booking: any) => {
//     const isLearner = booking.learnerId === user?.id;
//     const otherUserId = isLearner ? booking.teacherId : booking.learnerId;
//     return users.find(u => u.id === otherUserId);
//   };

//   const getSkillDetails = (skillId: string) => {
//     return skills.find(s => s.id === skillId);
//   };

//   const handleBookingAction = (bookingId: string, status: 'confirmed' | 'ongoing' | 'completed' | 'cancelled') => {
//     const updates: any = { status };
    
//     if (status === 'ongoing') {
//       updates.startTime = new Date().toISOString();
//     } else if (status === 'completed') {
//       updates.endTime = new Date().toISOString();
//     }
    
//     updateBooking(bookingId, updates);
//     const actionText = status.charAt(0).toUpperCase() + status.slice(1);
//     toast.success(`Session ${actionText} successfully`);
//   };

//   const getStatusBadgeColor = (status: string) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'ongoing':
//         return 'bg-blue-100 text-blue-800';
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="bg-white rounded-lg shadow">
//         <div className="border-b border-gray-200">
//           <nav className="-mb-px flex">
//             <button
//               className={`${
//                 activeTab === 'upcoming'
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
//               onClick={() => setActiveTab('upcoming')}
//             >
//               Upcoming Sessions
//             </button>
//             <button
//               className={`${
//                 activeTab === 'past'
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
//               onClick={() => setActiveTab('past')}
//             >
//               Past Sessions
//             </button>
//           </nav>
//         </div>

//         <div className="p-4">
//           {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(booking => {
//             const otherUser = getOtherUserDetails(booking);
//             const skill = getSkillDetails(booking.skillId);
//             const isTeacher = booking.teacherId === user?.id;
            
//             return (
//               <div
//                 key={booking.id}
//                 className="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
//               >
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="text-lg font-semibold">{skill?.title}</h3>
//                     <p className="text-gray-600">
//                       {booking.learnerId === user?.id ? 'Learning from' : 'Teaching'}{' '}
//                       {otherUser?.name}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {format(new Date(booking.date), 'PPP p')}
//                     </p>
//                     <span
//                       className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getStatusBadgeColor(booking.status)}`}
//                     >
//                       {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                     </span>
//                   </div>
                  
//                   <div className="flex space-x-2">
//                     {activeTab === 'upcoming' && (
//                       <>
//                         {isTeacher && booking.status === 'pending' && (
//                           <div className="flex space-x-2 mr-4">
//                             <button
//                               onClick={() => handleBookingAction(booking.id, 'confirmed')}
//                               className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
//                               title="Confirm Booking"
//                             >
//                               <CheckCircle className="h-5 w-5" />
//                             </button>
//                             <button
//                               onClick={() => handleBookingAction(booking.id, 'cancelled')}
//                               className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
//                               title="Cancel Booking"
//                             >
//                               <XCircle className="h-5 w-5" />
//                             </button>
//                           </div>
//                         )}
//                         {booking.status === 'confirmed' && (
//                           <button
//                             onClick={() => handleBookingAction(booking.id, 'ongoing')}
//                             className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
//                             title="Start Session"
//                           >
//                             <Play className="h-5 w-5" />
//                           </button>
//                         )}
//                         {booking.status === 'ongoing' && (
//                           <button
//                             onClick={() => handleBookingAction(booking.id, 'completed')}
//                             className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
//                             title="Complete Session"
//                           >
//                             <Check className="h-5 w-5" />
//                           </button>
//                         )}
//                         <button
//                           onClick={() => {
//                             setSelectedBooking(booking.id);
//                             setShowChat(true);
//                           }}
//                           className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
//                         >
//                           <MessageSquare className="h-5 w-5" />
//                         </button>
//                         {booking.status === 'ongoing' && (
//                           <button
//                             onClick={() => {
//                               setSelectedBooking(booking.id);
//                               setShowVideoCall(true);
//                             }}
//                             className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
//                           >
//                             <Video className="h-5 w-5" />
//                           </button>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {showChat && selectedBooking && (
//         <Chat
//           bookingId={selectedBooking} // Ensure this is the same for both users
//           onClose={() => {
//             setShowChat(false);
//             setSelectedBooking(null);
//           }}
//         />
//       )}

//       {showVideoCall && selectedBooking && (
//         <VideoCall
//           bookingId={selectedBooking}
//           onClose={() => {
//             setShowVideoCall(false);
//             setSelectedBooking(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };