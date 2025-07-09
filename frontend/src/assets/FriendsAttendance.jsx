import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDown, ChevronUp, Users, Star, TrendingUp, RotateCcw, Trash2 } from 'lucide-react';

const FriendsAttendance = () => {
  const backendUrl = 'https://attendance-4dtj.onrender.com/api/attendance';
  // Fetch attendance percentage for a single friend (using their roll and password)
  const fetchSingleAttendance = async (roll, encodedPassword) => {
    try {
      // Decode the friend's password
      const password = decode(encodedPassword || "");
      const res = await fetch(`${backendUrl}?student_id=${encodeURIComponent(roll)}&password=${encodeURIComponent(password)}`);
      const data = await res.json();
      console.log(data);
      // Prefer total_info.total_percentage if available
      if (data && data.total_info && data.total_info.total_percentage) {
        return data.total_info.total_percentage;
      }
      // fallback: try percentage from subjectwise_summary[0]
      if (
        data &&
        Array.isArray(data.subjectwise_summary) &&
        data.subjectwise_summary.length > 0 &&
        data.subjectwise_summary[0].percentage
      ) {
        return data.subjectwise_summary[0].percentage;
      }
      return null;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return null;
    }
  }
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");

  const [friends, setFriends] = useState(() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem("friends");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Store attendance percentages for each friend by roll
  const [attendanceMap, setAttendanceMap] = useState(() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem("friendsAttendance");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Save attendanceMap to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("friendsAttendance", JSON.stringify(attendanceMap));
  }, [attendanceMap]);

  // Simple base64 encode/decode helpers
  function encode(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return str;
    }
  }
  function decode(str) {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return str;
    }
  }

  // Add friend handler
  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!roll || !password) return;
    if (friends.some(f => f.roll === roll)) {
      alert("This roll number is already added.");
      return;
    }
    const newFriend = {
      name: roll,
      attendance: 0,
      streak: 0,
      avatar: '👤',
      trend: 'up',
      roll,
      password: encode(password)
    };
    const updated = [...friends, newFriend];
    setFriends(updated);
    localStorage.setItem("friends", JSON.stringify(updated));
    setRoll("");
    setPassword("");
    setShowAdd(false);
    // Fetch attendance for the new friend immediately
    setAttendanceMap(prev => ({ ...prev, [newFriend.roll]: null })); // show loading
    const perc = await fetchSingleAttendance(newFriend.roll, newFriend.password);
    setAttendanceMap(prev => ({ ...prev, [newFriend.roll]: perc }));
  };

  // Refresh attendance for a single friend
  const handleRefresh = async (friend) => {
    setAttendanceMap(prev => ({ ...prev, [friend.roll]: null })); // show loading
    const perc = await fetchSingleAttendance(friend.roll, friend.password);
    setAttendanceMap(prev => ({ ...prev, [friend.roll]: perc }));
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="max-w-2xl rounded-5xl mx-auto mt-10 mb-8 px-2 md:px-0">
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center shadow-md mr-3 md:mr-5">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Friends' Attendance</h3>
              <p className="text-gray-500 text-xs md:text-sm mt-1">See how your squad is doing</p>
            </div>
          </div>
          <div className="flex items-center gap-7">
            <button
              className="ml-2 px-2 py-1 text-md bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center justify-center"
              title="Delete all friends"
              onClick={() => setDeleteDialogOpen(true)}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {/* Headless UI Dialog for delete confirmation */}
            <Transition.Root show={deleteDialogOpen} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setDeleteDialogOpen}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Delete All Friends
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete all friends. This action cannot be undone.
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            onClick={() => setDeleteDialogOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                            onClick={() => {
                              setFriends([]);
                              setAttendanceMap({});
                              localStorage.removeItem('friends');
                              localStorage.removeItem('friendsAttendance');
                              setDeleteDialogOpen(false);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 rounded-full text-white font-medium text-xs md:text-sm"
              aria-label="Toggle friends attendance"
            >
             <p> {open ? 'Hide' : 'Show'}</p>
              <span className="ml-2 flex items-center justify-center">
                {open ? (
                  <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </span>
            </button>
          </div>
        </div>
        {/* Add Friend Button */}
        {open && (
        <div>
          <div className="flex justify-end px-4 md:px-6 pt-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded shadow"
              onClick={() => setShowAdd((v) => !v)}
            >
              {showAdd ? 'Cancel' : 'Add Friend'}
            </button>
          </div>
          {/* Add Friend Form */}
          {showAdd && (
            <form className="px-4 md:px-6 py-2 flex flex-col gap-2" onSubmit={handleAddFriend}>
              <input
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Roll Number"
                value={roll}
                onChange={e => setRoll(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 py-2 rounded mt-1"
              >
                Add
              </button>
            </form>
          )}
          {/* Expandable content with smooth animation */}
          {open && (
            friends.length === 0 ? (
              <div className="px-4 md:px-6 py-4 text-center text-gray-500">
                No friends added yet.
              </div>
            ) : (
              <div className="overflow-y-auto bg-gray-50 rounded-b-lg">
                <div className="px-3 md:px-6 py-3 md:py-4 pb-2">
                  <div className="space-y-3">
                    {friends.map((friend, index) => (
                      <div key={index} className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center text-base md:text-lg font-bold text-gray-700 mr-3 md:mr-4">
                            {friend.avatar}
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-gray-900 mr-2 text-sm md:text-base">{friend.name}</span>
                              {friend.streak > 5 && <Star className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <div className="flex items-center text-xs md:text-sm text-gray-500">
                              <span className="mr-2">{friend.streak} day streak</span>
                              <TrendingUp className={`w-3 h-3 ${friend.trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end mb-1 md:mb-2 gap-2">
                            <span className="text-xl md:text-2xl font-bold text-gray-900">
                              {attendanceMap[friend.roll] !== undefined && attendanceMap[friend.roll] !== null
                                ? `${attendanceMap[friend.roll]}%`
                                : <span className="text-gray-400 text-base">...</span>}
                            </span>
                            <button
                              className="ml-2 p-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center justify-center"
                              title="Refresh attendance"
                              onClick={() => handleRefresh(friend)}
                              type="button"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Progress bar */}
                          <div className="w-12 md:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-blue-500 rounded-full transition-all duration-500`}
                              style={{ width: attendanceMap[friend.roll] ? `${attendanceMap[friend.roll]}%` : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default FriendsAttendance;