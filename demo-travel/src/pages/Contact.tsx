import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { fetchCategories, fetchPublicTours } from '../services/travelApi';

const ContactPage = () => {
  const [tourCount, setTourCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        const [tours, categories] = await Promise.all([fetchPublicTours(), fetchCategories(true)]);
        if (active) {
          setTourCount(tours.length);
          setCategoryCount(categories.length);
        }
      } catch {
        if (active) {
          setTourCount(0);
          setCategoryCount(0);
        }
      }
    };

    loadOverview();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h1 className="mb-4 text-4xl font-black text-primary uppercase">Lien He 28.Travel</h1>
            <p className="mb-8 max-w-2xl text-gray-600 leading-7">
              He thong hien dang phuc vu {tourCount} tour cong khai thuoc {categoryCount} danh muc. Neu ban can tu van
              dat tour, doi lich khoi hanh hoac can bao gia cho nhom, doi ngu se ho tro nhanh qua cac kenh ben duoi.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-primary/5 p-5">
                <div className="mb-3 inline-flex rounded-2xl bg-primary p-3 text-white">
                  <Phone size={20} />
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">Hotline</h2>
                <p className="text-gray-600">0123 456 789</p>
              </div>

              <div className="rounded-2xl bg-primary/5 p-5">
                <div className="mb-3 inline-flex rounded-2xl bg-primary p-3 text-white">
                  <Mail size={20} />
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">Email</h2>
                <p className="text-gray-600">contact@28travel.com</p>
              </div>

              <div className="rounded-2xl bg-primary/5 p-5">
                <div className="mb-3 inline-flex rounded-2xl bg-primary p-3 text-white">
                  <MapPin size={20} />
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">Van phong</h2>
                <p className="text-gray-600">123 Le Loi, Quan 1, TP.HCM</p>
              </div>

              <div className="rounded-2xl bg-primary/5 p-5">
                <div className="mb-3 inline-flex rounded-2xl bg-primary p-3 text-white">
                  <Clock size={20} />
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">Gio lam viec</h2>
                <p className="text-gray-600">08:00 - 18:00, Thu 2 den Chu nhat</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-primary p-8 text-white shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Thong tin nhanh</h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-wider opacity-70">Dat tour nhom</p>
                <p className="mt-2 text-lg font-semibold">Bao gia rieng cho cong ty, gia dinh va doan tu tuc.</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider opacity-70">Ho tro lich khoi hanh</p>
                <p className="mt-2 text-lg font-semibold">Kiem tra nhanh tinh trang cho trong va tu van doi lich.</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider opacity-70">Thong tin thanh toan</p>
                <p className="mt-2 text-lg font-semibold">Xac nhan don hang va cap nhat trang thai thanh toan theo thoi gian thuc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
