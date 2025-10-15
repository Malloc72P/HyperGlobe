import { Link } from 'react-router-dom';
import { A01_BasicPage } from '../pages/a01-basic';
import { A02_Step1Page } from '../pages/a02-step1';

export const NavModel = {
  a01_basic: {
    name: 'A01_Basic',
    link: '/a01-basic',
    component: A01_BasicPage,
  },
  a02_step1: {
    name: 'A02_Step1',
    link: '/a02-step1',
    component: A02_Step1Page,
  },
};

export function Nav() {
  return (
    <ul>
      {Object.entries(NavModel).map(([key, value]) => (
        <li className="py-2 text-gray-500 hover:text-gray-900" key={key}>
          <Link to={value.link}>{value.component.name}</Link>
        </li>
      ))}
    </ul>
  );
}
